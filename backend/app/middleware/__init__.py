"""
Middleware package for Auditbot application.
"""
from app.middleware.auth import get_current_user

__all__ = ["get_current_user"]