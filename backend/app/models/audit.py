"""
Audit model definitions using Pydantic v2.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class MissingRequirement(BaseModel):
    """Model for a missing requirement in the audit."""
    requirement: str = Field(..., description="The requirement that is missing")
    explanation: str = Field(..., description="Explanation of why it's missing")
    suggestion: str = Field(..., description="Suggestion for how to address it")


class AuditBase(BaseModel):
    """Base audit model with common fields."""
    noteText: str = Field(..., description="PHI-stripped clinical note text")
    codeId: str = Field(..., description="CCM code being audited against")
    riskLevel: RiskLevel = Field(..., description="Overall risk level (low/medium/high)")
    riskScore: int = Field(..., ge=0, le=100, description="Risk score from 0-100")
    missingRequirements: List[MissingRequirement] = Field(
        default_factory=list,
        description="List of missing requirements"
    )
    metRequirements: List[str] = Field(
        default_factory=list,
        description="List of requirements that were met"
    )
    clinicalConditions: List[str] = Field(
        default_factory=list,
        description="Clinical conditions identified in the note"
    )


class AuditCreate(BaseModel):
    """Audit creation request model."""
    noteText: str = Field(..., description="Clinical note text to analyze")
    codeId: str = Field(..., description="CCM code to audit against")
    noteId: Optional[str] = Field(None, description="Optional clinical note ID if uploaded")


class Audit(AuditBase):
    """Audit model for API responses."""
    id: str = Field(..., alias="_id", description="Unique identifier")
    userId: str = Field(..., description="ID of the user who created the audit")
    organizationId: str = Field(..., description="ID of the organization")
    createdAt: datetime = Field(..., description="Timestamp when the audit was created")
    deletedAt: Optional[datetime] = Field(None, description="Timestamp when the audit was soft deleted")
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "userId": "507f1f77bcf86cd799439012",
                "organizationId": "org_123456",
                "noteText": "Patient presents with diabetes and hypertension...",
                "codeId": "99490",
                "riskLevel": "medium",
                "riskScore": 65,
                "missingRequirements": [
                    {
                        "requirement": "At least 20 minutes of clinical staff time",
                        "explanation": "No time documentation found in the note",
                        "suggestion": "Add time tracking documentation"
                    }
                ],
                "metRequirements": [
                    "Multiple chronic conditions documented",
                    "Care plan discussed"
                ],
                "clinicalConditions": [
                    "Type 2 Diabetes",
                    "Hypertension"
                ],
                "createdAt": "2024-01-01T00:00:00Z"
            }
        }
    )


class AuditHistoryResponse(BaseModel):
    """Response model for audit history endpoint with pagination."""
    audits: List[Audit]
    total: int
    page: int
    limit: int
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "audits": [],
                "total": 50,
                "page": 1,
                "limit": 10
            }
        }
    )


class AuditInDB(Audit):
    """Audit model as stored in database."""
    pass


class AuditResponse(BaseModel):
    """Response model for audit analysis endpoint."""
    audit: Audit
    quotaUsed: int
    quotaLimit: int
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "audit": {
                    "_id": "507f1f77bcf86cd799439011",
                    "userId": "507f1f77bcf86cd799439012",
                    "organizationId": "org_123456",
                    "noteText": "Patient presents with diabetes...",
                    "codeId": "99490",
                    "riskLevel": "medium",
                    "riskScore": 65,
                    "missingRequirements": [],
                    "metRequirements": [],
                    "clinicalConditions": [],
                    "createdAt": "2024-01-01T00:00:00Z"
                },
                "quotaUsed": 5,
                "quotaLimit": 100
            }
        }
    )