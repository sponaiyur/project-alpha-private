from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import aiomysql
import bcrypt
import secrets
import base64
import jwt
from datetime import datetime, timedelta
import os
import logging
from dotenv import load_dotenv

load_dotenv()
# Get logger
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create router
router = APIRouter()

# Pydantic models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    username:str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    name: str
    email: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

# Utility functions
def generate_user_id() -> str:
    """Generate a unique user ID"""
    return base64.urlsafe_b64encode(secrets.token_bytes(12)).decode('utf-8').rstrip("=")

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode('utf-8')

def verify_password(password: str, hashed) -> bool:
    """Verify password against hash"""
    try:
        # Handle different types that might come from the database
        if isinstance(hashed, str):
            hashed_bytes = hashed.encode('utf-8')
        elif isinstance(hashed, bytes):
            hashed_bytes = hashed
        elif isinstance(hashed, bytearray):
            hashed_bytes = bytes(hashed)
        elif hashed is None:
            logger.error("Password hash is None")
            return False
        else:
            # Try to convert to string first, then to bytes
            logger.warning(f"Unexpected password hash type: {type(hashed)}, attempting conversion")
            hashed_bytes = str(hashed).encode('utf-8')
        
        return bcrypt.checkpw(password.encode('utf-8'), hashed_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {e}, hash type: {type(hashed)}")
        return False

def create_jwt_token(email: str) -> str:
    """Create JWT token"""
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Helper function to get db pool (imported from main app)
def get_db_pool():
    from app import get_db_connection
    return get_db_connection()

# Routes
@router.post("/register", response_model=dict)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        db_pool = get_db_pool()
        async with db_pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Check if user already exists
                await cur.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (user_data.email,)
                )
                if await cur.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already exists"
                    )
                
                # Create new user
                user_id = generate_user_id()
                hashed_password = hash_password(user_data.password)
                
                await cur.execute(
                    "INSERT INTO users (id, name, email, password, username) VALUES (%s, %s, %s, %s, %s)",
                    (user_id, user_data.name, user_data.email, hashed_password, user_data.username)
                )
                await conn.commit()
                
                logger.info(f"User registered successfully: {user_data.email}")
                return {"message": "User registered successfully"}
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT token"""
    try:
        db_pool = get_db_pool()
        async with db_pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Get user from database
                await cur.execute(
                    "SELECT name, email, password FROM users WHERE email = %s",
                    (user_credentials.email,)
                )
                user = await cur.fetchone()
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid email or password"
                    )
                
                # Verify password
                if not verify_password(user_credentials.password, user['password']):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid email or password"
                    )
                
                # Create token
                token = create_jwt_token(user['email'])
                
                logger.info(f"User logged in successfully: {user['email']}")
                logger.info(TokenResponse(
                    token=token,
                    user=UserResponse(name=user['name'], email=user['email'])
                ))
                return TokenResponse(
                    token=token,
                    user=UserResponse(name=user['name'], email=user['email'])
                )
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/dashboard", response_model=dict)
async def dashboard(current_user: str = Depends(get_current_user)):
    """Protected dashboard endpoint"""
    try:
        db_pool = get_db_pool()
        if db_pool is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database not available"
            )
            
        async with db_pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(
                    "SELECT name, email FROM users WHERE email = %s",
                    (current_user,)
                )
                user = await cur.fetchone()
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="User not found"
                    )
                
                return {
                    "user": UserResponse(name=user['name'], email=user['email']),
                    "message": f"Welcome to your dashboard, {user['name']}!"
                }
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/verify", response_model=dict)
async def verify_token(current_user: str = Depends(get_current_user)):
    """Verify if token is still valid"""
    return {"valid": True, "user": current_user}