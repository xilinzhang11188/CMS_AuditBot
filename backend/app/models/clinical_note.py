"""
Clinical Note model definitions using Pydantic v2.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ClinicalNoteBase(BaseModel):
    """Base clinical note model with common fields."""
    fileName: str = Field(..., description="Original filename of the uploaded file")
    fileType: str = Field(..., description="File type/extension (txt, doc, docx, pdf)")
    fileSize: int = Field(..., description="File size in bytes")
    extractedText: str = Field(..., description="Extracted text content from the file")


class ClinicalNoteCreate(ClinicalNoteBase):
    """Clinical note creation model."""
    userId: str = Field(..., description="ID of the user who uploaded the note")


class ClinicalNote(ClinicalNoteBase):
    """Clinical note model for API responses."""
    id: str = Field(..., alias="_id", description="Unique identifier")
    userId: str = Field(..., description="ID of the user who uploaded the note")
    createdAt: datetime = Field(..., description="Timestamp when the note was uploaded")
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "fileName": "patient_note.txt",
                "fileType": "txt",
                "fileSize": 2048,
                "extractedText": "Patient presents with...",
                "userId": "507f1f77bcf86cd799439012",
                "createdAt": "2024-01-01T00:00:00Z"
            }
        }
    )


class ClinicalNoteInDB(ClinicalNote):
    """Clinical note model as stored in database."""
    pass


class ClinicalNoteUploadResponse(BaseModel):
    """Response model for file upload endpoint."""
    noteId: str
    fileName: str
    extractedText: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "noteId": "507f1f77bcf86cd799439011",
                "fileName": "patient_note.txt",
                "extractedText": "Patient presents with..."
            }
        }
    )