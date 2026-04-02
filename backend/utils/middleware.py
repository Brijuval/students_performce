"""Custom Django middleware for request logging and error handling."""

import json
import logging
import time

from django.http import JsonResponse

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Logs each incoming request and its response time."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = round((time.monotonic() - start) * 1000, 2)

        logger.info(
            "%s %s %s %sms",
            request.method,
            request.get_full_path(),
            response.status_code,
            duration_ms,
        )
        return response


class ErrorHandlingMiddleware:
    """
    Catches unhandled exceptions and returns a JSON 500 response.

    This acts as a safety net below the DRF exception handler.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        logger.exception(
            "Unhandled exception on %s %s: %s",
            request.method,
            request.get_full_path(),
            exception,
        )
        return JsonResponse(
            {
                'error': True,
                'status_code': 500,
                'message': 'An unexpected server error occurred. Please try again later.',
                'details': None,
            },
            status=500,
        )
