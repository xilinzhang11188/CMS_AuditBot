"""
Management router for organization-wide audit management.
Only accessible by users with manager role.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
import logging

from app.models.user import User
from app.models.audit import Audit
from app.middleware.role_check import require_manager
from app.database import mongodb
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/management", tags=["Management"])


class ProviderStats(BaseModel):
    """Statistics for a provider."""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    auditCount: int
    avgRiskScore: float
    highRiskCount: int
    
    class Config:
        populate_by_name = True


class ProviderDetail(BaseModel):
    """Detailed provider information with audits."""
    provider: ProviderStats
    audits: List[Audit]


class AuditWithProvider(BaseModel):
    """Audit with provider name included."""
    audit: Audit
    providerName: str


class ManagementAuditsResponse(BaseModel):
    """Response for organization-wide audits with pagination."""
    audits: List[AuditWithProvider]
    total: int
    page: int
    limit: int


@router.get("/providers", response_model=List[ProviderStats])
async def get_providers(
    current_user: User = Depends(require_manager)
):
    """
    Get all providers in the manager's organization with their statistics.
    
    - Requires manager role
    - Fetches all users with same organizationId
    - Calculates audit statistics for each provider
    - Returns list of providers with stats
    """
    try:
        users_collection = mongodb.get_collection("users")
        audits_collection = mongodb.get_collection("audits")
        
        # Fetch all users in the same organization
        cursor = users_collection.find({
            "organizationId": current_user.organizationId
        })
        users = await cursor.to_list(length=None)
        
        logger.info(f"Manager {current_user.id} fetching {len(users)} providers")
        
        # Calculate stats for each provider
        provider_stats = []
        for user in users:
            user_id = user["_id"]
            
            # Fetch all audits for this user
            audit_cursor = audits_collection.find({
                "userId": user_id,
                "deletedAt": None
            })
            user_audits = await audit_cursor.to_list(length=None)
            
            # Calculate statistics
            audit_count = len(user_audits)
            avg_risk_score = 0.0
            high_risk_count = 0
            
            if audit_count > 0:
                total_risk_score = sum(audit["riskScore"] for audit in user_audits)
                avg_risk_score = round(total_risk_score / audit_count, 1)
                high_risk_count = sum(1 for audit in user_audits if audit["riskLevel"] == "high")
            
            provider_stats.append(ProviderStats(
                _id=user_id,
                name=user["name"],
                email=user["email"],
                auditCount=audit_count,
                avgRiskScore=avg_risk_score,
                highRiskCount=high_risk_count
            ))
        
        return provider_stats
        
    except Exception as e:
        logger.error(f"Error fetching providers: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch providers: {str(e)}"
        )


@router.get("/audits", response_model=ManagementAuditsResponse)
async def get_organization_audits(
    current_user: User = Depends(require_manager),
    providerId: str = "",
    riskLevel: str = "",
    startDate: str = "",
    endDate: str = "",
    page: int = 1,
    limit: int = 10
):
    """
    Get all audits for users in the manager's organization.
    
    - Requires manager role
    - Fetches audits from all users in same organization
    - Supports filtering by provider, risk level, and date range
    - Includes provider name in each audit
    - Returns paginated results
    """
    try:
        users_collection = mongodb.get_collection("users")
        audits_collection = mongodb.get_collection("audits")
        
        # Get all user IDs in the organization
        cursor = users_collection.find(
            {"organizationId": current_user.organizationId},
            {"_id": 1, "name": 1}
        )
        org_users = await cursor.to_list(length=None)
        user_id_to_name = {user["_id"]: user["name"] for user in org_users}
        user_ids = list(user_id_to_name.keys())
        
        # Build query filter
        query = {
            "userId": {"$in": user_ids},
            "deletedAt": None
        }
        
        # Add provider filter
        if providerId:
            query["userId"] = providerId
        
        # Add risk level filter
        if riskLevel:
            query["riskLevel"] = riskLevel.lower()
        
        # Add date range filter
        if startDate or endDate:
            date_filter = {}
            if startDate:
                try:
                    date_filter["$gte"] = datetime.fromisoformat(startDate.replace('Z', '+00:00'))
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid startDate format. Use ISO 8601 format."
                    )
            if endDate:
                try:
                    date_filter["$lte"] = datetime.fromisoformat(endDate.replace('Z', '+00:00'))
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid endDate format. Use ISO 8601 format."
                    )
            query["createdAt"] = date_filter
        
        # Get total count
        total = await audits_collection.count_documents(query)
        
        # Calculate skip value for pagination
        skip = (page - 1) * limit
        
        # Fetch audits with pagination
        cursor = audits_collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        audits = await cursor.to_list(length=limit)
        
        # Add provider name to each audit
        audits_with_provider = []
        for audit in audits:
            provider_name = user_id_to_name.get(audit["userId"], "Unknown")
            audits_with_provider.append(AuditWithProvider(
                audit=Audit(**audit),
                providerName=provider_name
            ))
        
        logger.info(f"Manager {current_user.id} fetched {len(audits)} audits from organization")
        
        return ManagementAuditsResponse(
            audits=audits_with_provider,
            total=total,
            page=page,
            limit=limit
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching organization audits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audits: {str(e)}"
        )


@router.get("/provider/{provider_id}", response_model=ProviderDetail)
async def get_provider_detail(
    provider_id: str,
    current_user: User = Depends(require_manager)
):
    """
    Get detailed information about a specific provider and their audits.
    
    - Requires manager role
    - Verifies provider is in same organization
    - Fetches provider details and all their audits
    - Calculates provider statistics
    - Returns 403 if provider not in same organization
    - Returns 404 if provider not found
    """
    try:
        users_collection = mongodb.get_collection("users")
        audits_collection = mongodb.get_collection("audits")
        
        # Fetch provider details
        provider_doc = await users_collection.find_one({"_id": provider_id})
        
        if not provider_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found"
            )
        
        # Verify provider is in same organization
        if provider_doc["organizationId"] != current_user.organizationId:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Provider not in your organization."
            )
        
        # Fetch all audits for this provider
        cursor = audits_collection.find({
            "userId": provider_id,
            "deletedAt": None
        }).sort("createdAt", -1)
        audits = await cursor.to_list(length=None)
        
        # Calculate statistics
        audit_count = len(audits)
        avg_risk_score = 0.0
        high_risk_count = 0
        
        if audit_count > 0:
            total_risk_score = sum(audit["riskScore"] for audit in audits)
            avg_risk_score = round(total_risk_score / audit_count, 1)
            high_risk_count = sum(1 for audit in audits if audit["riskLevel"] == "high")
        
        provider_stats = ProviderStats(
            _id=provider_id,
            name=provider_doc["name"],
            email=provider_doc["email"],
            auditCount=audit_count,
            avgRiskScore=avg_risk_score,
            highRiskCount=high_risk_count
        )
        
        logger.info(f"Manager {current_user.id} fetched details for provider {provider_id}")
        
        return ProviderDetail(
            provider=provider_stats,
            audits=[Audit(**audit) for audit in audits]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching provider detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch provider details: {str(e)}"
        )