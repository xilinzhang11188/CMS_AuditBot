"""
Organization model definitions using Pydantic v2.
"""
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class OrganizationBase(BaseModel):
    """Base organization model with common fields."""
    name: str = Field(..., description="Organization name")
    auditQuotaLimit: int = Field(default=100, description="Maximum number of audits allowed per month")
    auditQuotaUsed: int = Field(default=0, description="Number of audits used this month")


class Organization(OrganizationBase):
    """Organization model for API responses."""
    id: str = Field(..., alias="_id", description="Unique identifier")
    createdAt: datetime = Field(..., description="Timestamp when the organization was created")
    quotaResetDate: datetime = Field(..., description="Date when the quota will reset")
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "org_123456789abc",
                "name": "Healthcare Clinic",
                "auditQuotaLimit": 100,
                "auditQuotaUsed": 25,
                "createdAt": "2024-01-01T00:00:00Z",
                "quotaResetDate": "2024-02-01T00:00:00Z"
            }
        }
    )


class OrganizationInDB(Organization):
    """Organization model as stored in database."""
    pass