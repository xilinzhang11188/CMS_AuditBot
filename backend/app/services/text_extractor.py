"""
Text extraction service for different file types.
Supports .txt, .doc, .docx, and .pdf files.
"""
import io
import logging
from typing import Tuple
from docx import Document
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


class TextExtractionError(Exception):
    """Custom exception for text extraction errors."""
    pass


async def extract_text_from_file(file_content: bytes, file_type: str, filename: str) -> str:
    """
    Extract text from uploaded file based on file type.
    
    Args:
        file_content: Raw bytes of the uploaded file
        file_type: File extension (txt, doc, docx, pdf)
        filename: Original filename for logging
        
    Returns:
        Extracted text content as string
        
    Raises:
        TextExtractionError: If extraction fails
    """
    try:
        file_type = file_type.lower().lstrip('.')
        
        if file_type == 'txt':
            return await _extract_from_txt(file_content)
        elif file_type in ['doc', 'docx']:
            return await _extract_from_docx(file_content)
        elif file_type == 'pdf':
            return await _extract_from_pdf(file_content)
        else:
            raise TextExtractionError(f"Unsupported file type: {file_type}")
            
    except TextExtractionError:
        raise
    except Exception as e:
        logger.error(f"Failed to extract text from {filename}: {str(e)}")
        raise TextExtractionError(f"Failed to extract text from file: {str(e)}")


async def _extract_from_txt(file_content: bytes) -> str:
    """
    Extract text from .txt file.
    
    Args:
        file_content: Raw bytes of the text file
        
    Returns:
        Decoded text content
    """
    try:
        # Try UTF-8 first, fall back to latin-1 if that fails
        try:
            text = file_content.decode('utf-8')
        except UnicodeDecodeError:
            text = file_content.decode('latin-1')
        
        return text.strip()
    except Exception as e:
        raise TextExtractionError(f"Failed to decode text file: {str(e)}")


async def _extract_from_docx(file_content: bytes) -> str:
    """
    Extract text from .doc/.docx file using python-docx.
    
    Args:
        file_content: Raw bytes of the Word document
        
    Returns:
        Extracted text content
    """
    try:
        # Create a file-like object from bytes
        file_stream = io.BytesIO(file_content)
        
        # Load the document
        doc = Document(file_stream)
        
        # Extract text from all paragraphs
        paragraphs = [paragraph.text for paragraph in doc.paragraphs]
        
        # Join paragraphs with newlines
        text = '\n'.join(paragraphs)
        
        return text.strip()
    except Exception as e:
        raise TextExtractionError(f"Failed to extract text from Word document: {str(e)}")


async def _extract_from_pdf(file_content: bytes) -> str:
    """
    Extract text from .pdf file using PyPDF2.
    
    Args:
        file_content: Raw bytes of the PDF file
        
    Returns:
        Extracted text content
    """
    try:
        # Create a file-like object from bytes
        file_stream = io.BytesIO(file_content)
        
        # Create PDF reader
        pdf_reader = PdfReader(file_stream)
        
        # Extract text from all pages
        text_parts = []
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        
        # Join all pages with double newlines
        full_text = '\n\n'.join(text_parts)
        
        return full_text.strip()
    except Exception as e:
        raise TextExtractionError(f"Failed to extract text from PDF: {str(e)}")


def validate_file_type(filename: str, allowed_types: list) -> Tuple[bool, str]:
    """
    Validate if file type is allowed.
    
    Args:
        filename: Name of the uploaded file
        allowed_types: List of allowed file extensions (e.g., ['txt', 'pdf'])
        
    Returns:
        Tuple of (is_valid, file_extension)
    """
    # Get file extension
    if '.' not in filename:
        return False, ''
    
    file_ext = filename.rsplit('.', 1)[1].lower()
    
    # Check if extension is allowed
    is_valid = file_ext in allowed_types
    
    return is_valid, file_ext


def validate_file_size(file_size: int, max_size_mb: int) -> bool:
    """
    Validate if file size is within allowed limit.
    
    Args:
        file_size: Size of file in bytes
        max_size_mb: Maximum allowed size in megabytes
        
    Returns:
        True if file size is valid, False otherwise
    """
    max_size_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_size_bytes