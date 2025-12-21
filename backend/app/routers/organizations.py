"""
Organizations router for fetching organization details and quota information.
"""
from fastapi import APIRouter, HTTPException, status, Depends

from app.models.organization import Organization
from app.models.user import User
from app.middleware.auth import get_current_user
from app.database import mongodb

router = APIRouter(prefix="/api/v1/organizations", tags=["Organizations"])


@router.get("/{organization_id}", response_model=Organization)
async def get_organization(
    organization_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get organization details by ID.
    
    - Requires authentication
    - Returns organization details including quota information
    - Only accessible by users in the same organization
    """
    # Check if user has access to this organization
    if current_user.organizationId != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization"
        )
    
    organizations_collection = mongodb.get_collection("organizations")
    
    org_doc = await organizations_collection.find_one({"_id": organization_id})
    
    if not org_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return Organization(**org_doc)