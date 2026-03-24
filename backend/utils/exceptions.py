"""Custom exception handler for Django REST Framework."""

import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotAuthenticated,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler.

    Converts all known exception types to a consistent JSON shape:
    {
        "error": true,
        "status_code": <int>,
        "message": "<str>",
        "details": <dict|list|null>
    }
    """
    # Let DRF do its initial processing
    response = exception_handler(exc, context)

    if response is not None:
        error_data = _build_error_payload(exc, response.status_code)
        response.data = error_data
        return response

    # Handle non-DRF exceptions that slipped through
    if isinstance(exc, DjangoValidationError):
        error_data = {
            'error': True,
            'status_code': status.HTTP_400_BAD_REQUEST,
            'message': 'Validation error.',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else exc.messages,
        }
        logger.warning("Django ValidationError: %s", exc)
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)

    # Unhandled exception – log and return 500
    logger.exception("Unhandled exception in %s: %s", context.get('view'), exc)
    error_data = {
        'error': True,
        'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
        'message': 'An unexpected error occurred. Please try again later.',
        'details': None,
    }
    return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _build_error_payload(exc, status_code: int) -> dict:
    """Build a normalised error payload dict from a DRF exception."""
    if isinstance(exc, ValidationError):
        message = 'Validation error.'
        details = exc.detail
    elif isinstance(exc, NotFound) or isinstance(exc, Http404):
        message = 'The requested resource was not found.'
        details = None
    elif isinstance(exc, PermissionDenied):
        message = 'You do not have permission to perform this action.'
        details = None
    elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        message = 'Authentication credentials were not provided or are invalid.'
        details = None
    elif isinstance(exc, APIException):
        message = exc.detail if isinstance(exc.detail, str) else 'An error occurred.'
        details = exc.detail if not isinstance(exc.detail, str) else None
    else:
        message = str(exc) or 'An error occurred.'
        details = None

    return {
        'error': True,
        'status_code': status_code,
        'message': message,
        'details': details,
    }
