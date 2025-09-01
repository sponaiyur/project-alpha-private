from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import aiomysql
import bcrypt
import secrets
import base64
import jwt
from datetime import datetime, timedelta
import asyncio
import os
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager
from typing import Optional


load_dotenv(dotenv_path='../.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for request/response validation
class UserRegister(BaseModel):
    name: str
    email: EmailStr
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

# Database connection pool
db_pool = None

async def get_db_pool():
    """Get database connection pool"""
    return await aiomysql.create_pool(
        host='localhost',
        port=3306,
        user='root',
        password=os.getenv("MYSQL_PASSWORD"),
        db="project_alpha",
        minsize=5,
        maxsize=20,
        autocommit=False
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    # Startup
    global db_pool
    try:
        db_pool = await get_db_pool()
        logger.info("Database connection pool created successfully")
    except Exception as e:
        logger.error(f"Failed to create database pool: {e}")
        raise
    
    yield
    
    # Shutdown
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()
        logger.info("Database connection pool closed")

# FastAPI app with lifespan management
app = FastAPI(
    title="Project Alpha API",
    description="A fast and secure authentication API",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

def generate_user_id() -> str:
    """Generate a unique user ID"""
    return base64.urlsafe_b64encode(secrets.token_bytes(12)).decode('utf-8').rstrip("=")

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())

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

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Project Alpha API is running", "version": "2.0.0"}

@app.post("/api/auth/register", response_model=dict)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
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
                    "INSERT INTO users (id, name, email, password) VALUES (%s, %s, %s, %s)",
                    (user_id, user_data.name, user_data.email, hashed_password)
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

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT token"""
    try:
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

@app.get("/api/dashboard", response_model=dict)
async def dashboard(current_user: str = Depends(get_current_user)):
    """Protected dashboard endpoint"""
    try:
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

@app.get("/api/auth/verify", response_model=dict)
async def verify_token(current_user: str = Depends(get_current_user)):
    """Verify if token is still valid"""
    return {"valid": True, "user": current_user}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=5000,
        reload=True,
        log_level="info"
    )