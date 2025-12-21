"""
CCM Codes router for fetching reference data.
"""
from fastapi import APIRouter, Depends
from typing import List

from app.models.ccm_code import CCMCode
from app.models.user import User
from app.middleware.auth import get_current_user
from app.database import mongodb

router = APIRouter(prefix="/api/v1/ccm-codes", tags=["CCM Codes"])


@router.get("", response_model=List[CCMCode])
async def get_ccm_codes(current_user: User = Depends(get_current_user)):
    """
    Get all CCM codes reference data.
    
    - Requires authentication
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