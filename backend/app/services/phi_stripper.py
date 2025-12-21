"""
PHI (Protected Health Information) stripping service.
Removes sensitive patient information while preserving clinical content.
"""
import re
from typing import Dict, List


class PHIStripper:
    """Service for removing PHI from clinical notes."""
    
    # Common name patterns (first and last names)
    NAME_PATTERNS = [
        r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # First Last
        r'\b(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+\b',  # Title + Name
    ]
    
    # SSN patterns
    SSN_PATTERNS = [
        r'\b\d{3}-\d{2}-\d{4}\b',  # 123-45-6789
        r'\b\d{9}\b',  # 123456789
    ]
    
    # Phone number patterns
    PHONE_PATTERNS = [
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # Various phone formats
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}\b',  # (123) 456-7890
    ]
    
    # Date patterns (but preserve age references)
    DATE_PATTERNS = [
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',  # MM/DD/YYYY or M/D/YY
        r'\b\d{1,2}-\d{1,2}-\d{2,4}\b',  # MM-DD-YYYY
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',  # Month DD, YYYY
        r'\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',  # DD Month YYYY
    ]
    
    # Address patterns
    ADDRESS_PATTERNS = [
        r'\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way)\b',
        r'\b[A-Z][a-z]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b',  # City, ST ZIP
    ]
    
    # Email patterns
    EMAIL_PATTERNS = [
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    ]
    
    # Medical record number patterns
    MRN_PATTERNS = [
        r'\bMRN[:\s]*\d+\b',
        r'\bMedical\s+Record\s+Number[:\s]*\d+\b',
    ]
    
    # Medical terms to preserve (common conditions, procedures, medications)
    MEDICAL_TERMS = [
        'diabetes', 'hypertension', 'copd', 'asthma', 'heart failure', 'chf',
        'coronary artery disease', 'cad', 'myocardial infarction', 'mi',
        'stroke', 'cva', 'chronic kidney disease', 'ckd', 'cancer',
        'depression', 'anxiety', 'dementia', 'alzheimer', 'parkinson',
        'arthritis', 'osteoporosis', 'thyroid', 'cholesterol',
        'blood pressure', 'glucose', 'a1c', 'hemoglobin', 'creatinine',
        'metformin', 'insulin', 'lisinopril', 'atorvastatin', 'aspirin',
        'warfarin', 'levothyroxine', 'omeprazole', 'albuterol',
    ]
    
    def __init__(self):
        """Initialize the PHI stripper."""
        pass
    
    def strip_phi(self, text: str) -> str:
        """
        Remove PHI from clinical note text while preserving medical information.
        
        Args:
            text: The clinical note text containing PHI
            
        Returns:
            The text with PHI removed/redacted
        """
        if not text:
            return text
        
        # Create a working copy
        cleaned_text = text
        
        # Track what we're replacing to avoid over-redaction
        replacements: List[Dict[str, str]] = []
        
        # 1. Strip SSNs
        for pattern in self.SSN_PATTERNS:
            cleaned_text = re.sub(pattern, '[SSN REDACTED]', cleaned_text)
        
        # 2. Strip phone numbers
        for pattern in self.PHONE_PATTERNS:
            cleaned_text = re.sub(pattern, '[PHONE REDACTED]', cleaned_text)
        
        # 3. Strip email addresses
        for pattern in self.EMAIL_PATTERNS:
            cleaned_text = re.sub(pattern, '[EMAIL REDACTED]', cleaned_text)
        
        # 4. Strip MRNs
        for pattern in self.MRN_PATTERNS:
            cleaned_text = re.sub(pattern, '[MRN REDACTED]', cleaned_text, flags=re.IGNORECASE)
        
        # 5. Strip addresses
        for pattern in self.ADDRESS_PATTERNS:
            cleaned_text = re.sub(pattern, '[ADDRESS REDACTED]', cleaned_text)
        
        # 6. Strip dates (but be careful not to strip age references)
        for pattern in self.DATE_PATTERNS:
            # Don't redact if it's part of "X years old" or similar age references
            cleaned_text = re.sub(
                pattern,
                lambda m: m.group(0) if self._is_age_reference(text, m.start()) else '[DATE REDACTED]',
                cleaned_text
            )
        
        # 7. Strip names (but preserve medical terms and common clinical phrases)
        # This is the most complex as we need to avoid stripping medical terms
        for pattern in self.NAME_PATTERNS:
            matches = re.finditer(pattern, cleaned_text)
            for match in matches:
                name = match.group(0)
                # Check if this is likely a medical term or clinical phrase
                if not self._is_medical_term(name.lower()):
                    cleaned_text = cleaned_text.replace(name, '[NAME REDACTED]', 1)
        
        return cleaned_text
    
    def _is_age_reference(self, text: str, position: int) -> bool:
        """
        Check if a date at the given position is part of an age reference.
        
        Args:
            text: The full text
            position: Position of the date match
            
        Returns:
            True if this appears to be an age reference
        """
        # Look at surrounding context (50 chars before and after)
        start = max(0, position - 50)
        end = min(len(text), position + 50)
        context = text[start:end].lower()
        
        # Check for age-related keywords
        age_keywords = ['year old', 'years old', 'y/o', 'yo', 'age', 'aged']
        return any(keyword in context for keyword in age_keywords)
    
    def _is_medical_term(self, text: str) -> bool:
        """
        Check if the text is likely a medical term that should be preserved.
        
        Args:
            text: The text to check
            
        Returns:
            True if this appears to be a medical term
        """
        # Check against known medical terms
        text_lower = text.lower()
        for term in self.MEDICAL_TERMS:
            if term in text_lower:
                return True
        
        # Check for common medical abbreviations (all caps, 2-5 letters)
        if re.match(r'^[A-Z]{2,5}$', text):
            return True
        
        return False


# Create a singleton instance
phi_stripper = PHIStripper()


def strip_phi_from_text(text: str) -> str:
    """
    Convenience function to strip PHI from text.
    
    Args:
        text: The clinical note text containing PHI
        
    Returns:
        The text with PHI removed/redacted
    """
    return phi_stripper.strip_phi(text)