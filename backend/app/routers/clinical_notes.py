"""
Clinical notes router with file upload and text extraction endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from datetime import datetime
import uuid

from app.models.clinical_note import ClinicalNoteUploadResponse, ClinicalNoteCreate
from app.models.user import User
from app.middleware.auth import get_current_user
from app.database import mongodb
from app.config import settings
from app.services.text_extractor import (
    extract_text_from_file,
    validate_file_type,
    validate_file_size,
    TextExtractionError
)

router = APIRouter(prefix="/api/v1/notes", tags=["Clinical Notes"])


@router.post("/upload", response_model=ClinicalNoteUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_clinical_note(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a clinical note file and extract text content.
    
    - Accepts .txt, .doc, .docx, and .pdf files
    - Maximum file size: 10MB
    - Extracts text from the uploaded file
    - Stores metadata in MongoDB
    - Returns noteId, fileName, and extractedText
    
    Requires authentication.
    """
    # Validate file type
    is_valid_type, file_ext = validate_file_type(
        file.filename,
        settings.ALLOWED_FILE_TYPES
    )
    
    if not is_valid_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
        )
    
    # Read file content
    try:
        file_content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )
    
    # Validate file size
    file_size = len(file_content)
    if not validate_file_size(file_size, settings.MAX_FILE_SIZE_MB):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
        )
    
    # Extract text from file
    try:
        extracted_text = await extract_text_from_file(
            file_content,
            file_ext,
            file.filename
        )
    except TextExtractionError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during text extraction: {str(e)}"
        )
    
    # Validate extracted text is not empty
    if not extracted_text or len(extracted_text.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No text content could be extracted from the file"
        )
    
    # Create clinical note document
    notes_collection = mongodb.get_collection("clinical_notes")
    note_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    note_doc = {
        "_id": note_id,
        "fileName": file.filename,
        "fileType": file_ext,
        "fileSize": file_size,
        "extractedText": extracted_text,
        "userId": current_user.id,
        "createdAt": now
    }
    
    # Insert note into database
    try:
        await notes_collection.insert_one(note_doc)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save clinical note: {str(e)}"
        )
    
    # Return response
    return ClinicalNoteUploadResponse(
        noteId=note_id,
        fileName=file.filename,
        extractedText=extracted_text
    )


@router.get("/{note_id}")
async def get_clinical_note(
    note_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a clinical note by ID.
    
    - Returns the clinical note if it belongs to the current user
    - Requires authentication
    """
    notes_collection = mongodb.get_collection("clinical_notes")
    
    # Find note by ID
    note_doc = await notes_collection.find_one({"_id": note_id})
    
    if not note_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinical note not found"
        )
    
    # Verify note belongs to current user
    if note_doc["userId"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this note"
        )
    
    return note_doc


@router.delete("/{note_id}")
async def delete_clinical_note(
    note_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a clinical note by ID.
    
    - Deletes the clinical note if it belongs to the current user
    - Requires authentication
    """
    notes_collection = mongodb.get_collection("clinical_notes")
    
    # Find note by ID
    note_doc = await notes_collection.find_one({"_id": note_id})
    
    if not note_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinical note not found"
        )
    
    # Verify note belongs to current user
    if note_doc["userId"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this note"
        )
    
    # Delete note
    await notes_collection.delete_one({"_id": note_id})
    
    return {"message": "Clinical note deleted successfully"}