from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import logging
import json
from datetime import datetime


class ErrorHandlingMiddleware(MiddlewareMixin):
    """Catch all exceptions and return proper JSON responses"""

    def process_exception(self, request, exception):
        logger = logging.getLogger(__name__)
        logger.error(f"Exception: {str(exception)}", exc_info=True)

        # Handle custom exceptions
        if hasattr(exception, 'status_code'):
            return JsonResponse({
                'success': False,
                'message': str(exception.message),
                'error_code': exception.error_code,
                'status_code': exception.status_code
            }, status=exception.status_code)

        # Handle validation errors
        if isinstance(exception, ValueError):
            return JsonResponse({
                'success': False,
                'message': str(exception),
                'error_code': 'VALIDATION_ERROR',
                'status_code': 400
            }, status=400)

        # Generic server error
        return JsonResponse({
            'success': False,
            'message': 'Internal server error',
            'error_code': 'SERVER_ERROR',
            'status_code': 500
        }, status=500)


class RequestLoggingMiddleware(MiddlewareMixin):
    """Log all requests and responses"""

    def process_request(self, request):
        request.start_time = datetime.now()
        logger = logging.getLogger(__name__)
        logger.info(f"{request.method} {request.path} - {request.META.get('REMOTE_ADDR')}")

    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = (datetime.now() - request.start_time).total_seconds()
            logger = logging.getLogger(__name__)
            logger.info(f"{request.method} {request.path} - {response.status_code} - {duration}s")
        return response
