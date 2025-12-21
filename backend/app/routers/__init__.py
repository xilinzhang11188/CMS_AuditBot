"""
Routers package for Auditbot application.
"""
from app.routers.auth import router as auth_router
from app.routers.ccm_codes import router as ccm_codes_router
from app.routers.clinical_notes import router as clinical_notes_router
from app.routers.audits import router as audits_router
from app.routers.organizations import router as organizations_router
from app.routers.management import router as management_router
from app.routers.users import router as users_router

__all__ = ["auth_router", "ccm_codes_router", "clinical_notes_router", "audits_router", "organizations_router", "management_router", "users_router"]