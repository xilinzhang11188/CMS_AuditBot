"""
Authentication router with signup, login, logout, and user profile endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
import uuid

from app.models.user import UserCreate, UserResponse, LoginRequest, User
from app.utils.auth import hash_password, verify_password, create_access_token
from app.middleware.auth import get_current_user
from app.database import mongodb

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user.
    
    - Creates a new user account with hashed password
    - Generates a unique organizationId for new organizations
    - Returns user object (without password) and JWT token
    """
    users_collection = mongodb.get_collection("users")
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate unique organizationId
    organization_id = f"org_{uuid.uuid4().hex[:12]}"
    
    # Create organization document
    organizations_collection = mongodb.get_collection("organizations")
    now = datetime.utcnow()
    next_month = now + timedelta(days=30)
    
    org_doc = {
        "_id": organization_id,
        "name": user_data.organizationName or f"{user_data.name}'s Organization",
        "auditQuotaLimit": 100,
        "auditQuotaUsed": 0,
        "createdAt": now,
        "quotaResetDate": next_month
    }
    
    await organizations_collection.insert_one(org_doc)
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user document
    user_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    user_doc = {
        "_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": user_data.role.value,
        "organizationId": organization_id,
        "hashedPassword": hashed_password,
        "createdAt": now,
        "lastLoginAt": now
    }
    
    # Insert user into database
    await users_collection.insert_one(user_doc)
    
    # Create JWT token
    token_data = {
        "sub": user_id,
        "email": user_data.email,
        "role": user_data.role.value
    }
    access_token = create_access_token(token_data)
    
    # Create user response (without password)
    user = User(
        _id=user_id,
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        organizationId=organization_id,
        createdAt=now,
        lastLoginAt=now
    )
    
    return UserResponse(user=user, token=access_token)


@router.post("/login", response_model=UserResponse)
async def login(login_data: LoginRequest):
    """
    Authenticate a user and return JWT token.
    
    - Verifies email and password
    - Updates lastLoginAt timestamp
    - Returns user object and JWT token
    """
    users_collection = mongodb.get_collection("users")
    
    # Find user by email
    user_doc = await users_collection.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user_doc["hashedPassword"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update lastLoginAt
    now = datetime.utcnow()
    await users_collection.update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"lastLoginAt": now}}
    )
    
    # Create JWT token
    token_data = {
        "sub": user_doc["_id"],
        "email": user_doc["email"],
        "role": user_doc["role"]
    }
    access_token = create_access_token(token_data)
    
    # Create user response (without password)
    user = User(
        _id=user_doc["_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        organizationId=user_doc["organizationId"],
        createdAt=user_doc["createdAt"],
        lastLoginAt=now
    )
    
    return UserResponse(user=user, token=access_token)


@router.post("/logout")
async def logout():
    """
    Logout endpoint.
    
    - Returns success message
    - Client should remove token from storage
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's profile.
    
    - Requires valid JWT token in Authorization header
    - Returns user object without password
    """
    return current_user