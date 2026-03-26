import logging
from functools import wraps

from django.http import JsonResponse

from .exceptions import ForbiddenError, UnauthorizedError, ValidationError
from .response import APIResponse


def require_permission(permission):
    """Decorator to check user permissions"""
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


def validate_request(required_fields):
    """Decorator to validate request data"""
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
    """Decorator to handle exceptions in views"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            return view_func(request, *args, **kwargs)
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Exception in {view_func.__name__}: {str(e)}", exc_info=True)
            if hasattr(e, 'status_code'):
                return JsonResponse(APIResponse.error(
                    str(e.message), e.error_code, e.status_code
                ), status=e.status_code)
            return JsonResponse(APIResponse.error(
                'Internal server error', 'SERVER_ERROR', 500
            ), status=500)
    return wrapper
