"""
Organizations router for fetching organization details and quota information.
"""
from fastapi import APIRouter, HTTPException, status, Depends
import logging

from app.models.organization import Organization
from app.models.user import User
from app.middleware.auth import get_current_user
from app.database import mongodb

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/organizations", tags=["Organizations"])


@router.get("/quota")
async def get_organization_quota(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current organization's audit quota usage.
    
    - Returns used and limit quota information
    - Requires authentication
    """
    try:
        organizations_collection = mongodb.get_collection("organizations")
        
        logger.info(f"Fetching quota for organization: {current_user.organizationId}")
        org = await organizations_collection.find_one({"_id": current_user.organizationId})
        
        if not org:
            logger.error(f"Organization not found: {current_user.organizationId}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        quota_data = {
            "used": org.get("auditQuotaUsed", 0),
            "limit": org.get("auditQuotaLimit", 100)
        }
        
        logger.info(f"Quota data for org {current_user.organizationId}: {quota_data}")
        return quota_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching quota: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quota: {str(e)}"
        )


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