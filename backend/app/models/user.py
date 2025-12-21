"""
User model definitions using Pydantic v2.
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration."""
    PROVIDER = "provider"
    MANAGER = "manager"


class UserBase(BaseModel):
    """Base user model with common fields."""
    email: EmailStr
    name: str
    role: UserRole


class UserCreate(UserBase):
    """User creation model with password."""
    password: str = Field(..., min_length=8)
    organizationName: Optional[str] = None  # For new organizations


class User(UserBase):
    """User model for API responses (without password)."""
    id: str = Field(..., alias="_id")
    organizationId: str
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "name": "John Doe",
                "role": "provider",
                "organizationId": "org_123456",
                "createdAt": "2024-01-01T00:00:00Z",
                "lastLoginAt": "2024-01-02T00:00:00Z"
            }
        }
    )


class UserInDB(User):
    """User model as stored in database (with hashed password)."""
    hashedPassword: str


class UserResponse(BaseModel):
    """Response model for authentication endpoints."""
    user: User
    token: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user": {
                    "_id": "507f1f77bcf86cd799439011",
                    "email": "user@example.com",
                    "name": "John Doe",
                    "role": "provider",
                    "organizationId": "org_123456",
                    "createdAt": "2024-01-01T00:00:00Z",
                    "lastLoginAt": "2024-01-02T00:00:00Z"
                },
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
    )


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }
    )