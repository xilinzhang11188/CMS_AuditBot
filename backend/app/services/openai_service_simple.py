"""
Simple OpenAI service using requests library to avoid client initialization issues.
"""
import json
import logging
import requests
from typing import Dict, List, Any
from app.config import settings

logger = logging.getLogger(__name__)


class SimpleOpenAIService:
    """Simple service for interacting with OpenAI API using requests."""
    
    def __init__(self):
        """Initialize the OpenAI service."""
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4o-mini"  # Use gpt-4o-mini which supports JSON response format
        self.base_url = "https://api.openai.com/v1"
    
    def analyze_note(
        self,
        note_text: str,
        ccm_code: str,
        requirements: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze a clinical note against CCM code requirements using OpenAI.
        """
        try:
            if self.api_key == "your-openai-api-key-here":
                raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY in .env file.")
            
            # Construct the prompt
            prompt = self._build_prompt(note_text, ccm_code, requirements)
            
            # Prepare the request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert medical billing auditor specializing in CMS Chronic Care Management (CCM) codes. Your task is to analyze clinical notes and determine if they meet billing requirements."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 2000,
                "response_format": {"type": "json_object"}
            }
            
            logger.info(f"Calling OpenAI API for CCM code {ccm_code} analysis")
            
            # Make the API call
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code != 200:
                error_details = response.text
                logger.error(f"OpenAI API error: {response.status_code}")
                logger.error(f"Error response body: {error_details}")
                
                # Try to parse error details for better messaging
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_msg = error_json["error"].get("message", "Unknown error")
                        error_type = error_json["error"].get("type", "Unknown type")
                        logger.error(f"OpenAI error type: {error_type}, message: {error_msg}")
                        raise Exception(f"OpenAI API error: {error_msg}")
                except:
                    pass
                
                raise Exception(f"OpenAI API error: {response.status_code} - {error_details}")
            
            # Parse the response
            response_data = response.json()
            content = response_data["choices"][0]["message"]["content"]
            logger.info("Received response from OpenAI API")
            
            # Parse JSON response
            result = json.loads(content)
            
            # Validate the response structure
            self._validate_response(result)
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            raise Exception(f"Failed to connect to OpenAI API: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {str(e)}")
            raise ValueError(f"Invalid JSON response from OpenAI: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in OpenAI service: {str(e)}")
            raise
    
    def _build_prompt(
        self,
        note_text: str,
        ccm_code: str,
        requirements: List[str]
    ) -> str:
        """Build the prompt for OpenAI analysis."""
        requirements_text = "\n".join([f"{i+1}. {req}" for i, req in enumerate(requirements)])
        
        prompt = f"""Analyze the following clinical note to determine if it meets the requirements for CCM billing code {ccm_code}.

CCM CODE: {ccm_code}

REQUIREMENTS:
{requirements_text}

CLINICAL NOTE:
{note_text}

Please analyze the note and provide a JSON response with the following structure:
{{
    "riskLevel": "low|medium|high",
    "riskScore": <integer 0-100>,
    "missingRequirements": [
        {{
            "requirement": "<the requirement that is missing>",
            "explanation": "<why it's missing or not documented>",
            "suggestion": "<specific suggestion for how to address this>"
        }}
    ],
    "metRequirements": [
        "<requirement 1 that was met>",
        "<requirement 2 that was met>"
    ],
    "clinicalConditions": [
        "<condition 1 identified>",
        "<condition 2 identified>"
    ]
}}

SCORING GUIDELINES:
- riskLevel should be "high" if 3 or more requirements are missing
- riskLevel should be "medium" if 1-2 requirements are missing
- riskLevel should be "low" if all requirements are met
- riskScore should be 0-100, where 100 is perfect compliance and 0 is complete non-compliance
- Be specific in explanations and suggestions
- Identify all chronic conditions mentioned in the note
- Only mark a requirement as "met" if there is clear documentation in the note

Respond ONLY with valid JSON, no additional text."""
        
        return prompt
    
    def _validate_response(self, result: Dict[str, Any]) -> None:
        """Validate the structure of the OpenAI response."""
        required_fields = [
            "riskLevel",
            "riskScore",
            "missingRequirements",
            "metRequirements",
            "clinicalConditions"
        ]
        
        for field in required_fields:
            if field not in result:
                raise ValueError(f"Missing required field in OpenAI response: {field}")
        
        # Validate riskLevel
        if result["riskLevel"] not in ["low", "medium", "high"]:
            raise ValueError(f"Invalid riskLevel: {result['riskLevel']}")
        
        # Validate riskScore
        if not isinstance(result["riskScore"], int) or not (0 <= result["riskScore"] <= 100):
            raise ValueError(f"Invalid riskScore: {result['riskScore']}")
        
        # Validate missingRequirements structure
        if not isinstance(result["missingRequirements"], list):
            raise ValueError("missingRequirements must be a list")
        
        for req in result["missingRequirements"]:
            if not isinstance(req, dict):
                raise ValueError("Each missing requirement must be a dict")
            required_req_fields = ["requirement", "explanation", "suggestion"]
            for field in required_req_fields:
                if field not in req:
                    raise ValueError(f"Missing field in missing requirement: {field}")
        
        # Validate metRequirements
        if not isinstance(result["metRequirements"], list):
            raise ValueError("metRequirements must be a list")
        
        # Validate clinicalConditions
        if not isinstance(result["clinicalConditions"], list):
            raise ValueError("clinicalConditions must be a list")


# Create a singleton instance
simple_openai_service = SimpleOpenAIService()


def analyze_clinical_note(
    note_text: str,
    ccm_code: str,
    requirements: List[str]
) -> Dict[str, Any]:
    """
    Convenience function to analyze a clinical note using the simple service.
    """
    return simple_openai_service.analyze_note(note_text, ccm_code, requirements)