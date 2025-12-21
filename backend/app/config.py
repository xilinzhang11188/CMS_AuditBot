"""
Application configuration using Pydantic settings.
Loads environment variables from .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application settings
    APP_ENV: str = "development"
    PORT: int = 8000
    
    # Database settings
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "auditbot"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # JWT Authentication settings
    JWT_SECRET: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_IN: int = 24  # hours
    
    # File upload settings
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = ["txt", "doc", "docx", "pdf"]
    
    # OpenAI settings
    OPENAI_API_KEY: str = "your-openai-api-key-here"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Create global settings instance
settings = Settings()