"""
User settings and profile management router.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from app.models.user import User
from app.utils.auth import hash_password, verify_password
from app.middleware.auth import get_current_user
from app.database import mongodb

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


class UserProfileResponse(BaseModel):
    """User profile response with quota information."""
    id: str = Field(..., alias="_id")
    email: str
    name: str
    role: str
    organizationId: str
    createdAt: datetime
    lastLoginAt: datetime | None
    quotaUsed: int
    quotaLimit: int


class ProfileUpdateRequest(BaseModel):
    """Request model for profile updates."""
    name: str | None = Field(None, min_length=1)
    email: EmailStr | None = None


class PasswordChangeRequest(BaseModel):
    """Request model for password changes."""
    currentPassword: str = Field(..., min_length=1)
    newPassword: str = Field(..., min_length=8)


@router.get("/me", response_model=UserProfileResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile with quota information.
    
    - Returns user profile (without password)
    - Includes audit quota usage from organization
    """
    users_collection = mongodb.get_collection("users")
    organizations_collection = mongodb.get_collection("organizations")
    
    # Get user document
    user_doc = await users_collection.find_one({"_id": current_user.id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get organization quota information
    org_doc = await organizations_collection.find_one({"_id": user_doc["organizationId"]})
    quota_used = 0
    quota_limit = 100
    
    if org_doc:
        quota_used = org_doc.get("auditQuotaUsed", 0)
        quota_limit = org_doc.get("auditQuotaLimit", 100)
    
    # Build response
    return UserProfileResponse(
        _id=user_doc["_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        organizationId=user_doc["organizationId"],
        createdAt=user_doc["createdAt"],
        lastLoginAt=user_doc.get("lastLoginAt"),
        quotaUsed=quota_used,
        quotaLimit=quota_limit
    )


@router.patch("/me", response_model=User)
async def update_user_profile(
    update_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Update current user's profile.
    
    - Accept: { "name": str, "email": str }
    - Validate email uniqueness if changed
    - Update user in MongoDB
    - Return updated user object
    """
    users_collection = mongodb.get_collection("users")
    
    # Build update document
    update_fields = {}
    
    if update_data.name is not None:
        update_fields["name"] = update_data.name
    
    if update_data.email is not None:
        # Check if email is being changed
        if update_data.email != current_user.email:
            # Verify email uniqueness
            existing_user = await users_collection.find_one({"email": update_data.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
            update_fields["email"] = update_data.email
    
    # If no fields to update, return current user
    if not update_fields:
        return current_user
    
    # Update user in database
    result = await users_collection.update_one(
        {"_id": current_user.id},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    # Fetch and return updated user
    updated_user_doc = await users_collection.find_one({"_id": current_user.id})
    
    return User(
        _id=updated_user_doc["_id"],
        email=updated_user_doc["email"],
        name=updated_user_doc["name"],
        role=updated_user_doc["role"],
        organizationId=updated_user_doc["organizationId"],
        createdAt=updated_user_doc["createdAt"],
        lastLoginAt=updated_user_doc.get("lastLoginAt")
    )


@router.patch("/me/password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Change current user's password.
    
    - Accept: { "currentPassword": str, "newPassword": str }
    - Verify current password matches
    - Hash new password with Argon2
    - Update password in MongoDB
    - Return success message
    """
    users_collection = mongodb.get_collection("users")
    
    # Get user document with password
    user_doc = await users_collection.find_one({"_id": current_user.id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(password_data.currentPassword, user_doc["hashedPassword"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_hashed_password = hash_password(password_data.newPassword)
    
    # Update password in database
    result = await users_collection.update_one(
        {"_id": current_user.id},
        {"$set": {"hashedPassword": new_hashed_password}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    
    return {"message": "Password updated successfully"}