"""
FastAPI main application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from app.config import settings
from app.database import mongodb
from app.routers import auth_router, ccm_codes_router, clinical_notes_router, audits_router, organizations_router, management_router, users_router

app = FastAPI(
    title="Auditbot API",
    description="Backend API for Auditbot healthcare audit management system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(ccm_codes_router)
app.include_router(clinical_notes_router)
app.include_router(audits_router)
app.include_router(organizations_router)
app.include_router(management_router)
app.include_router(users_router)


@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection on startup."""
    await mongodb.connect()


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown."""
    await mongodb.disconnect()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Auditbot API",
        "version": "1.0.0",
        "environment": settings.APP_ENV
    }


@app.get("/healthz")
async def health_check():
    """
    Health check endpoint that verifies database connectivity.
    Returns status, database connection state, and timestamp.
    """
    try:
        # Ping MongoDB to verify connection
        await mongodb.ping()
        
        return {
            "status": "ok",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "environment": settings.APP_ENV
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.APP_ENV == "development"
    )