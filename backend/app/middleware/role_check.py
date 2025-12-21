"""
Role-based access control middleware.
"""
from fastapi import HTTPException, status, Depends
from functools import wraps
from typing import Callable

from app.models.user import User, UserRole
from app.middleware.auth import get_current_user


def require_manager(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to check if user has manager role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if user is a manager
        
    Raises:
        HTTPException: 403 if user is not a manager
    """
    if current_user.role != UserRole.MANAGER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Manager role required."
        )
    
    return current_user