"""
Authentication middleware for JWT token verification.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.utils.auth import decode_access_token
from app.models.user import User
from app.database import mongodb

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        User object if token is valid
        
    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    token = credentials.credentials
    
    # Decode and verify token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user_id from token
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    users_collection = mongodb.get_collection("users")
    user_doc = await users_collection.find_one({"_id": user_id})
    
    if user_doc is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert MongoDB document to User model
    user = User(
        _id=user_doc["_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        organizationId=user_doc["organizationId"],
        createdAt=user_doc["createdAt"],
        lastLoginAt=user_doc.get("lastLoginAt")
    )
    
    return user