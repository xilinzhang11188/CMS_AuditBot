"""
CCM Codes router for fetching reference data.
"""
from fastapi import APIRouter
from typing import List

from app.models.ccm_code import CCMCode
from app.database import mongodb

router = APIRouter(prefix="/api/v1/ccm-codes", tags=["CCM Codes"])


@router.get("", response_model=List[CCMCode])
async def get_ccm_codes():
    """
    Get all CCM codes reference data.
    
    - Public endpoint (no authentication required)
    - Returns array of all 6 CCM billing codes with their requirements
    - Used by frontend to populate code selection dropdown
    """
    ccm_codes_collection = mongodb.get_collection("ccm_codes")
    
    # Fetch all CCM codes from database
    codes_cursor = ccm_codes_collection.find({}).sort("code", 1)
    codes = await codes_cursor.to_list(length=10)
    
    # Convert to CCMCode models
    ccm_codes = [CCMCode(**code) for code in codes]
    
    return ccm_codes