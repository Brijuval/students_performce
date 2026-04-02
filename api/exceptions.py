import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Custom exception handler that returns consistent error responses."""
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'error': True,
            'status_code': response.status_code,
            'message': _get_error_message(response.data),
            'details': response.data,
        }
        response.data = error_data
        return response

    # Handle unhandled exceptions
    logger.exception('Unhandled exception: %s', exc)
    return Response(
        {
            'error': True,
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'An unexpected server error occurred.',
            'details': str(exc),
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _get_error_message(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        messages = []
        for key, value in data.items():
            if isinstance(value, list):
                messages.append(f"{key}: {', '.join(str(v) for v in value)}")
            else:
                messages.append(f"{key}: {value}")
        return '; '.join(messages) if messages else 'Validation error.'
    if isinstance(data, list):
        return ', '.join(str(item) for item in data)
    return str(data)
