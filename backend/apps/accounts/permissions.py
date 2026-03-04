"""
FILE:     backend/apps/accounts/permissions.py
PURPOSE:  Role-based permission classes used across all apps
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Only admin-role users."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin
        )


class IsAgentOrAdmin(BasePermission):
    """Agent or admin can create / manage listings."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ("admin", "agent")
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: only the owner or an admin may mutate."""
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_admin:
            return True
        # Support both .user and .listed_by owner fields
        owner = getattr(obj, "user", None) or getattr(obj, "listed_by", None)
        return owner == request.user


class IsAdminOrReadOnly(BasePermission):
    """Read-only for everyone; write only for admins."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)