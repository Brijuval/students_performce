"""View and request-handling decorators for the Students Performance API.

These decorators can be applied to Django view functions to enforce
authentication, validate incoming request data, and provide uniform
exception handling without repeating boilerplate in every view.
"""

import logging
from functools import wraps

from django.http import JsonResponse

from .exceptions import ForbiddenError, UnauthorizedError, ValidationError
from .response import APIResponse


def require_permission(permission: str):
    """Decorator that enforces a specific Django permission on a view.

    Raises ``UnauthorizedError`` (401) if the user is not authenticated and
    ``ForbiddenError`` (403) if the user lacks the required permission.

    Args:
        permission: A Django permission string in ``"app.codename"`` format,
            e.g. ``"api.view_student"``.

    Usage::

        @require_permission("api.delete_student")
        def delete_student(request, pk):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                raise UnauthorizedError()
            if not request.user.has_perm(permission):
                raise ForbiddenError()
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def validate_request(required_fields: list[str]):
    """Decorator that checks all required fields are present in request data.

    Raises ``ValidationError`` (400) listing any missing fields before the
    view function is called, short-circuiting the request early.

    Args:
        required_fields: A list of field name strings that must be present in
            ``request.data`` (DRF) or ``request.POST`` (plain Django).

    Usage::

        @validate_request(["name", "email", "enrollment_date"])
        def create_student(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            data = request.data if hasattr(request, 'data') else request.POST
            missing = [f for f in required_fields if f not in data]
            if missing:
                raise ValidationError(f"Missing required fields: {', '.join(missing)}")
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def handle_exceptions(view_func):
    """Decorator that wraps a view in a try/except to return JSON error responses.

    Catches any ``APIException`` subclass (with ``status_code``) and converts it
    to a structured JSON error response. All other exceptions are caught and
    returned as a generic 500 server error to prevent leaking internal details.

    Usage::

        @handle_exceptions
        def my_view(request):
            ...
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Exception in {view_func.__name__}: {str(e)}", exc_info=True)
            # Return a structured error for known API exceptions
            if hasattr(e, 'status_code'):
                return JsonResponse(APIResponse.error(
                    str(e.message), e.error_code, e.status_code
                ), status=e.status_code)
            # Fallback generic error for unexpected exceptions
            return JsonResponse(APIResponse.error(
                'Internal server error', 'SERVER_ERROR', 500
            ), status=500)
    return wrapper
