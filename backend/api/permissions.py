"""Custom DRF permissions for the Students Performance API."""

from rest_framework.permissions import BasePermission


class IsReadOnly(BasePermission):
    """Allows read-only (GET, HEAD, OPTIONS) access to any request."""

    SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')

    def has_permission(self, request, view):
        return request.method in self.SAFE_METHODS
