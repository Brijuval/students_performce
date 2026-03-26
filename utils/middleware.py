"""Django middleware for global error handling and request/response logging."""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import logging
import json
from datetime import datetime


class ErrorHandlingMiddleware(MiddlewareMixin):
    """Catch unhandled exceptions and return structured JSON error responses.

    This middleware intercepts any exception that propagates out of a view and
    converts it into a JSON response so that API clients always receive a
    consistent error format instead of an HTML error page.

    Custom exceptions that expose a ``status_code`` attribute (i.e., subclasses
    of ``utils.exceptions.APIException``) are returned with their own status
    code and error code.  All other exceptions result in a generic 500 response.
    """

    def process_exception(self, request, exception):
        """Convert an unhandled exception into a JSON error response.

        Args:
            request: The Django ``HttpRequest`` object.
            exception: The unhandled exception instance.

        Returns:
            A ``JsonResponse`` with error details, or ``None`` to let Django's
            default exception handling proceed.
        """
        logger = logging.getLogger(__name__)
        logger.error(f"Exception: {str(exception)}", exc_info=True)

        # Handle custom APIException subclasses (have status_code attribute)
        if hasattr(exception, 'status_code'):
            return JsonResponse({
                'success': False,
                'message': str(exception.message),
                'error_code': exception.error_code,
                'status_code': exception.status_code
            }, status=exception.status_code)

        # Handle Python built-in ValueError as a validation error
        if isinstance(exception, ValueError):
            return JsonResponse({
                'success': False,
                'message': str(exception),
                'error_code': 'VALIDATION_ERROR',
                'status_code': 400
            }, status=400)

        # Generic fallback for all other unhandled exceptions
        return JsonResponse({
            'success': False,
            'message': 'Internal server error',
            'error_code': 'SERVER_ERROR',
            'status_code': 500
        }, status=500)


class RequestLoggingMiddleware(MiddlewareMixin):
    """Log the method, path, client IP, response status, and elapsed time for every request.

    Request details are logged at INFO level on arrival. Response details
    (including duration) are logged at INFO level on completion.  All output
    goes through the ``utils.middleware`` logger so it can be routed via the
    Django ``LOGGING`` configuration in ``core/settings.py``.
    """

    def process_request(self, request):
        """Record the request start time and log the incoming request.

        Args:
            request: The Django ``HttpRequest`` object.
        """
        # Store start time on the request so process_response can compute duration
        request.start_time = datetime.now()
        logger = logging.getLogger(__name__)
        logger.info(f"{request.method} {request.path} - {request.META.get('REMOTE_ADDR')}")

    def process_response(self, request, response):
        """Log the response status and request duration, then return the response unchanged.

        Args:
            request: The Django ``HttpRequest`` object (may have ``start_time`` set).
            response: The Django ``HttpResponse`` object.

        Returns:
            The original ``response`` object, unmodified.
        """
        if hasattr(request, 'start_time'):
            duration = (datetime.now() - request.start_time).total_seconds()
            logger = logging.getLogger(__name__)
            logger.info(f"{request.method} {request.path} - {response.status_code} - {duration}s")
        return response
