from fastapi import APIRouter, HTTPException, Depends, status, Form, UploadFile, File
from pydantic import BaseModel
import aiomysql
import os
import logging
import uuid
import json
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

# Import from auth_routes
from auth_routes import get_current_user

# Models
class PostResponse(BaseModel):
    id: int
    title: str
    type: str
    content_json: str
    tags: str
    category: str
    file_url: Optional[str] = None
    url: Optional[str] = None
    author: Optional[str] = None
    user_id: str
    created_at: datetime

# Database helper
async def get_db_pool():
    """Get database pool from main app"""
    from app import db_pool
    if db_pool is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database not available"
        )
    return db_pool

async def get_user_id_from_email(email: str) -> str:
    """Get user ID from email"""
    try:
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                user = await cur.fetchone()
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="User not found"
                    )
                
                return user['id']
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User lookup failed"
        )

# Routes
@router.post("/posts", response_model=dict)
async def create_post(
    title: str = Form(...),
    type: str = Form(...),
    content_json: str = Form(...),
    tags: str = Form(...),
    category: str = Form(...),
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user)
):
    """Create a new post"""
    try:
        # Debug logging - log all received parameters
        """logger.info(f"=== POST CREATION DEBUG ===")
        logger.info(f"User: {current_user}")
        logger.info(f"Title: {repr(title)} (type: {type(title)})")
        logger.info(f"Type: {repr(type)} (type: {type(type)})")
        logger.info(f"Content JSON: {repr(content_json[:100])}... (type: {type(content_json)})")
        logger.info(f"Tags: {repr(tags)} (type: {type(tags)})")
        logger.info(f"Category: {repr(category)} (type: {type(category)})")
        logger.info(f"URL: {repr(url)} (type: {type(url)})")
        logger.info(f"Author: {repr(author)} (type: {type(author)})")
        logger.info(f"File: {file.filename if file else None}")"""
        
        user_id = await get_user_id_from_email(current_user)
        logger.info(f"User ID: {user_id}")
        
        # Handle file upload
        file_url = None
        if file:
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}" if file_extension else str(uuid.uuid4().hex)
            file_path = os.path.join(upload_dir, unique_filename)
            
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            file_url = f"/uploads/{unique_filename}"

        #convert tags to JSON format
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        tags_json = json.dumps(tag_list) if tag_list else json.dumps([])
        
        # Save to database
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(
                    """INSERT INTO posts (user_id, title, type, content_json, tags, category, file_url, author, created_at) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (user_id, title, type, content_json, tags_json, category, file_url, author, datetime.utcnow())
                )
                
                post_id = cur.lastrowid
                await conn.commit()
                
                logger.info(f"Post created: {post_id} by {current_user}")
                
                return {
                    "message": "Post created successfully",
                    "post_id": post_id,
                    "file_url": file_url
                }
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Post creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Post creation failed"
        )

@router.get("/posts", response_model=list[dict])
async def get_posts(
    limit: int = 10,
    offset: int = 0,
    current_user: str = Depends(get_current_user)
):
    """Get user posts"""
    try:
        user_id = await get_user_id_from_email(current_user)
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(
                    """SELECT id, title, type, content_json, tags, category, file_url, url, author, created_at 
                       FROM posts WHERE user_id = %s 
                       ORDER BY created_at DESC LIMIT %s OFFSET %s""",
                    (user_id, limit, offset)
                )
                posts = await cur.fetchall()
                return posts
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch posts"
        )

@router.get("/posts/{post_id}", response_model=dict)
async def get_post(
    post_id: int,
    current_user: str = Depends(get_current_user)
):
    """Get specific post"""
    try:
        user_id = await get_user_id_from_email(current_user)
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(
                    """SELECT id, title, type, content_json, tags, category, file_url, url, author, created_at 
                       FROM posts WHERE id = %s AND user_id = %s""",
                    (post_id, user_id)
                )
                post = await cur.fetchone()
                
                if not post:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Post not found"
                    )
                
                return post
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch post"
        )

@router.put("/posts/{post_id}", response_model=dict)
async def update_post(
    post_id: int,
    title: str = Form(...),
    type: str = Form(...),
    content_json: str = Form(...),
    tags: str = Form(...),
    category: str = Form(...),
    url: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user)
):
    """Update post"""
    try:
        user_id = await get_user_id_from_email(current_user)

        #update tags to json format
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        tags_json = json.dumps(tag_list) if tag_list else json.dumps([])
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Check ownership
                await cur.execute(
                    "SELECT id FROM posts WHERE id = %s AND user_id = %s",
                    (post_id, user_id)
                )
                
                if not await cur.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Post not found"
                    )
                
                # Update
                await cur.execute(
                    """UPDATE posts SET title = %s, type = %s, content_json = %s, tags = %s, 
                       category = %s, url = %s, author = %s 
                       WHERE id = %s AND user_id = %s""",
                    (title, type, content_json, tags_json, category, url, author, post_id, user_id)
                )
                await conn.commit()
                
                logger.info(f"Post updated: {post_id} by {current_user}")
                return {"message": "Post updated successfully"}
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update post"
        )

@router.delete("/posts/{post_id}", response_model=dict)
async def delete_post(
    post_id: int,
    current_user: str = Depends(get_current_user)
):
    """Delete post"""
    try:
        user_id = await get_user_id_from_email(current_user)
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Check ownership
                await cur.execute(
                    "SELECT id FROM posts WHERE id = %s AND user_id = %s",
                    (post_id, user_id)
                )
                
                if not await cur.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Post not found"
                    )
                
                # Delete
                await cur.execute(
                    "DELETE FROM posts WHERE id = %s AND user_id = %s",
                    (post_id, user_id)
                )
                await conn.commit()
                
                logger.info(f"Post deleted: {post_id} by {current_user}")
                return {"message": "Post deleted successfully"}
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting post: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete post"
        )