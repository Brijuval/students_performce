"""
Custom middleware for the Student Performance Management System.
"""

import json
import logging
import time

from django.http import JsonResponse
from rest_framework import status

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Log each incoming request with method, path, and response time."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = round((time.time() - start) * 1000, 2)
        logger.info(
            "%s %s %s %.2fms",
            request.method,
            request.path,
            response.status_code,
            duration_ms,
        )
        return response


class ErrorHandlingMiddleware:
    """Convert unhandled exceptions to structured JSON responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        from utils.exceptions import AppException

        if isinstance(exception, AppException):
            logger.warning("Application error: %s", exception.message)
            return JsonResponse(
                exception.to_dict(), status=exception.status_code
            )

        logger.exception("Unhandled exception: %s", str(exception))
        return JsonResponse(
            {"error": "An unexpected error occurred. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
