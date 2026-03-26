"""Custom exception classes for the Students Performance API.

All exceptions inherit from ``APIException`` so that middleware and view
decorators can catch them uniformly and return structured JSON error responses.
"""


class APIException(Exception):
    """Base exception for all API errors.

    Attributes:
        message: Human-readable error description.
        status_code: HTTP status code to return to the client.
        error_code: Machine-readable error identifier (e.g., 'NOT_FOUND').
    """

    def __init__(self, message: str, status_code: int = 500, error_code: str | None = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code


class ValidationError(APIException):
    """Raised when request data fails validation (HTTP 400).

    Attributes:
        field: Optional name of the specific field that failed validation.
    """

    def __init__(self, message: str, field: str | None = None):
        super().__init__(message, 400, 'VALIDATION_ERROR')
        self.field = field


class NotFoundError(APIException):
    """Raised when a requested resource does not exist (HTTP 404).

    Args:
        resource: Name of the resource that was not found (e.g., 'Student').
    """

    def __init__(self, resource: str):
        message = f"{resource} not found"
        super().__init__(message, 404, 'NOT_FOUND')


class UnauthorizedError(APIException):
    """Raised when the request is not authenticated (HTTP 401)."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401, 'UNAUTHORIZED')


class ForbiddenError(APIException):
    """Raised when the authenticated user lacks permission (HTTP 403)."""

    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, 403, 'FORBIDDEN')


class ConflictError(APIException):
    """Raised when a request conflicts with existing data (HTTP 409).

    Typically used for duplicate-record errors (e.g., duplicate email).
    """

    def __init__(self, message: str = "Conflict"):
        super().__init__(message, 409, 'CONFLICT')


class ServerError(APIException):
    """Raised for unexpected server-side errors (HTTP 500)."""

    def __init__(self, message: str = "Internal server error"):
        super().__init__(message, 500, 'SERVER_ERROR')
