"""
Standardized response formatting helpers.
"""

from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """Return a standardized success response."""
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)


def error_response(
    message="An error occurred",
    details=None,
    status_code=status.HTTP_400_BAD_REQUEST,
):
    """Return a standardized error response."""
    payload = {"success": False, "error": message}
    if details is not None:
        payload["details"] = details
    return Response(payload, status=status_code)


def paginated_response(paginator, data, message="Success"):
    """Return a paginated response with metadata."""
    return Response(
        {
            "success": True,
            "message": message,
            "count": paginator.page.paginator.count,
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
            "results": data,
        }
    )
