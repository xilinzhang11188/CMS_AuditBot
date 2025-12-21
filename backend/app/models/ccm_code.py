"""
CCM Code model definitions using Pydantic v2.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List


class CCMCodeBase(BaseModel):
    """Base CCM code model with common fields."""
    code: str = Field(..., description="CCM billing code (e.g., 99490)")
    description: str = Field(..., description="Full description of the CCM code")
    timeRequirement: str = Field(..., description="Time requirement (e.g., '20 minutes')")
    complexity: str = Field(..., description="Complexity level (e.g., 'Basic', 'Complex')")
    requirements: List[str] = Field(..., description="List of billing requirements")


class CCMCode(CCMCodeBase):
    """CCM code model for API responses."""
    id: str = Field(..., alias="_id", description="Unique identifier (same as code)")
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "99490",
                "code": "99490",
                "description": "Chronic care management services, at least 20 minutes...",
                "timeRequirement": "20 minutes",
                "complexity": "Basic",
                "requirements": [
                    "Multiple (two or more) chronic conditions...",
                    "At least 20 minutes of clinical staff time per calendar month"
                ]
            }
        }
    )


class CCMCodeInDB(CCMCode):
    """CCM code model as stored in database."""
    pass