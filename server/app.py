from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import aiomysql
import os
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager

# Import route modules
from auth_routes import router as auth_router
from write_routes import router as write_router

load_dotenv(dotenv_path='../.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global database connection pool
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

# Dependency to get database pool
async def get_database():
    """Dependency to get database pool"""
    if db_pool is None:
        raise HTTPException(status_code=500, detail="Database not available")
    return db_pool

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

# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Project Alpha API is running", "version": "2.0.0"}

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(write_router, prefix="/api", tags=["Posts"])

# Make db_pool available to other modules (keep for backward compatibility)
def get_db_connection():
    """Get database connection pool for other modules"""
    return db_pool

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=5000,
        reload=True,
        log_level="info"
    )