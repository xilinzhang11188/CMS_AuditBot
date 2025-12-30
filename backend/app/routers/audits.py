"""
Audits router for analyzing clinical notes against CCM requirements.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
import uuid
import logging

from app.models.audit import AuditCreate, Audit, AuditResponse, AuditHistoryResponse, MissingRequirement, RiskLevel
from app.models.user import User
from app.middleware.auth import get_current_user
from app.database import mongodb
from app.services.openai_service_simple import analyze_clinical_note
from app.services.phi_stripper import strip_phi_from_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/audits", tags=["Audits"])


@router.post("/analyze", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def analyze_audit(
    audit_data: AuditCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Analyze a clinical note against CCM code requirements.
    
    - Checks user's audit quota
    - Fetches CCM code requirements from database
    - Strips PHI from note text
    - Calls OpenAI API for analysis
    - Calculates risk level based on missing requirements
    - Saves audit to database
    - Increments organization's quota usage
    - Deletes temporary clinical note if provided
    - Returns audit result with quota information
    """
    try:
        # 1. Check quota
        organizations_collection = mongodb.get_collection("organizations")
        org = await organizations_collection.find_one({"_id": current_user.organizationId})
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        if org["auditQuotaUsed"] >= org["auditQuotaLimit"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Audit quota exceeded. Limit: {org['auditQuotaLimit']}, Used: {org['auditQuotaUsed']}"
            )
        
        # 2. Fetch CCM code requirements
        ccm_codes_collection = mongodb.get_collection("ccm_codes")
        ccm_code = await ccm_codes_collection.find_one({"_id": audit_data.codeId})
        
        if not ccm_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CCM code not found: {audit_data.codeId}"
            )
        
        logger.info(f"Analyzing note for CCM code {audit_data.codeId} by user {current_user.id}")
        
        # 3. Strip PHI from note text
        stripped_note_text = strip_phi_from_text(audit_data.noteText)
        logger.info("PHI stripped from note text")
        
        # 4. Call OpenAI service for analysis
        try:
            analysis_result = analyze_clinical_note(
                note_text=audit_data.noteText,  # Send original text to OpenAI for better analysis
                ccm_code=ccm_code["code"],
                requirements=ccm_code["requirements"]
            )
            logger.info("OpenAI analysis completed successfully")
        except Exception as e:
            logger.error(f"OpenAI analysis failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to analyze note: {str(e)}"
            )
        
        # 5. Calculate risk level (validate OpenAI's assessment)
        missing_count = len(analysis_result["missingRequirements"])
        if missing_count >= 2:
            risk_level = RiskLevel.HIGH
        elif missing_count >= 1:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW
        
        # Override if OpenAI's assessment differs significantly
        if analysis_result["riskLevel"] != risk_level.value:
            logger.warning(
                f"Risk level mismatch: OpenAI={analysis_result['riskLevel']}, "
                f"Calculated={risk_level.value}. Using calculated value."
            )
            analysis_result["riskLevel"] = risk_level.value
        
        # 6. Create audit document
        audit_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Convert missing requirements to proper format
        missing_requirements = [
            MissingRequirement(**req) for req in analysis_result["missingRequirements"]
        ]
        
        audit_doc = {
            "_id": audit_id,
            "userId": current_user.id,
            "organizationId": current_user.organizationId,
            "noteText": stripped_note_text,  # Store PHI-stripped version
            "codeId": audit_data.codeId,
            "riskLevel": analysis_result["riskLevel"],
            "riskScore": analysis_result["riskScore"],
            "missingRequirements": [req.model_dump() for req in missing_requirements],
            "metRequirements": analysis_result["metRequirements"],
            "clinicalConditions": analysis_result["clinicalConditions"],
            "createdAt": now,
            "deletedAt": None
        }
        
        # 7. Save audit to database
        audits_collection = mongodb.get_collection("audits")
        await audits_collection.insert_one(audit_doc)
        logger.info(f"Audit saved with ID: {audit_id}")
        
        # 8. Increment organization's quota usage
        await organizations_collection.update_one(
            {"_id": current_user.organizationId},
            {"$inc": {"auditQuotaUsed": 1}}
        )
        logger.info(f"Organization quota incremented: {org['auditQuotaUsed'] + 1}/{org['auditQuotaLimit']}")
        
        # 9. Delete temporary clinical note if provided
        if audit_data.noteId:
            clinical_notes_collection = mongodb.get_collection("clinical_notes")
            result = await clinical_notes_collection.delete_one({"_id": audit_data.noteId})
            if result.deleted_count > 0:
                logger.info(f"Deleted temporary clinical note: {audit_data.noteId}")
        
        # 10. Create response
        audit = Audit(**audit_doc)
        logger.info(f"Created audit response with ID: {audit.id}")
        
        return AuditResponse(
            audit=audit,
            quotaUsed=org["auditQuotaUsed"] + 1,
            quotaLimit=org["auditQuotaLimit"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in audit analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/history", response_model=AuditHistoryResponse)
async def get_audit_history(
    current_user: User = Depends(get_current_user),
    search: str = "",
    riskLevel: str = "",
    startDate: str = "",
    endDate: str = "",
    page: int = 1,
    limit: int = 10
):
    """
    Get audit history for the current user with filtering and pagination.
    
    - Filters by userId (current user only)
    - Excludes soft-deleted audits (deletedAt is null)
    - Supports search by clinical conditions (case-insensitive)
    - Supports filtering by risk level and date range
    - Returns paginated results with total count
    """
    audits_collection = mongodb.get_collection("audits")
    
    # Build query filter
    query = {
        "userId": current_user.id,
        "deletedAt": None  # Exclude soft-deleted audits
    }
    
    # Add search filter (case-insensitive match on clinical conditions)
    if search:
        query["clinicalConditions"] = {
            "$elemMatch": {"$regex": search, "$options": "i"}
        }
    
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
    
    return AuditHistoryResponse(
        audits=[Audit(**audit) for audit in audits],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/{audit_id}", response_model=Audit)
async def get_audit(
    audit_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific audit by ID.
    
    - Requires authentication
    - Verifies user owns the audit
    - Returns full audit details including PHI-stripped note
    - Returns 404 if not found or not owned by user
    """
    audits_collection = mongodb.get_collection("audits")
    
    audit_doc = await audits_collection.find_one({
        "_id": audit_id,
        "deletedAt": None  # Exclude soft-deleted audits
    })
    
    if not audit_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found"
        )
    
    # Check if user owns this audit
    if audit_doc["userId"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found"
        )
    
    return Audit(**audit_doc)


@router.delete("/{audit_id}")
async def delete_audit(
    audit_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete an audit by setting deletedAt timestamp.
    
    - Requires authentication
    - Verifies user owns the audit
    - Sets deletedAt field instead of hard delete
    - Returns success message
    """
    audits_collection = mongodb.get_collection("audits")
    
    # Check if audit exists and user owns it
    audit_doc = await audits_collection.find_one({
        "_id": audit_id,
        "deletedAt": None
    })
    
    if not audit_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found"
        )
    
    # Check if user owns this audit
    if audit_doc["userId"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found"
        )
    
    # Soft delete by setting deletedAt timestamp
    now = datetime.utcnow()
    await audits_collection.update_one(
        {"_id": audit_id},
        {"$set": {"deletedAt": now}}
    )
    
    logger.info(f"Audit {audit_id} soft deleted by user {current_user.id}")
    
    return {"message": "Audit deleted successfully"}


@router.get("/compare", response_model=list[Audit])
async def compare_audits(
    ids: str,
    current_user: User = Depends(get_current_user)
):
    """
    Compare multiple audits side-by-side (max 3).
    
    - Requires authentication
    - Accepts comma-separated audit IDs in query param
    - Maximum 3 audits can be compared
    - Verifies user owns all audits
    - Returns array of full audit details
    - Returns 400 if more than 3 IDs provided
    - Returns 404 if any audit not found or not owned
    """
    # Parse comma-separated IDs
    audit_ids = [id.strip() for id in ids.split(',') if id.strip()]
    
    # Validate max 3 audits
    if len(audit_ids) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 3 audits can be compared at once"
        )
    
    if len(audit_ids) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one audit ID is required"
        )
    
    audits_collection = mongodb.get_collection("audits")
    
    # Fetch all audits
    audits = []
    for audit_id in audit_ids:
        audit_doc = await audits_collection.find_one({
            "_id": audit_id,
            "deletedAt": None
        })
        
        if not audit_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Audit not found: {audit_id}"
            )
        
        # Verify user owns this audit
        if audit_doc["userId"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Audit not found: {audit_id}"
            )
        
        audits.append(Audit(**audit_doc))
    
    logger.info(f"User {current_user.id} comparing {len(audits)} audits")
    
    return audits


@router.get("", response_model=list[Audit])
async def get_audits(
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    skip: int = 0
):
    """
    Get all audits for the current user's organization.
    
    - Requires authentication
    - Returns list of audits sorted by creation date (newest first)
    - Supports pagination with limit and skip parameters
    """
    audits_collection = mongodb.get_collection("audits")
    
    # Fetch audits for the user's organization
    cursor = audits_collection.find(
        {"organizationId": current_user.organizationId}
    ).sort("createdAt", -1).skip(skip).limit(limit)
    
    audits = await cursor.to_list(length=limit)
    
    return [Audit(**audit) for audit in audits]