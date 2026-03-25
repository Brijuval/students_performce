"""
Custom exception classes for the Student Performance Management System.
"""


class AppException(Exception):
    """Base exception class for application errors."""

    status_code = 500
    default_message = "An unexpected error occurred."

    def __init__(self, message=None, details=None):
        self.message = message or self.default_message
        self.details = details
        super().__init__(self.message)

    def to_dict(self):
        result = {"error": self.message}
        if self.details:
            result["details"] = self.details
        return result


class ValidationError(AppException):
    """Raised when input validation fails."""

    status_code = 400
    default_message = "Validation error."


class NotFoundError(AppException):
    """Raised when a requested resource is not found."""

    status_code = 404
    default_message = "Resource not found."


class UnauthorizedError(AppException):
    """Raised when authentication is required or fails."""

    status_code = 401
    default_message = "Authentication required."


class ForbiddenError(AppException):
    """Raised when the user lacks permission."""

    status_code = 403
    default_message = "You do not have permission to perform this action."


class ConflictError(AppException):
    """Raised when a resource conflict occurs (e.g. duplicate entry)."""

    status_code = 409
    default_message = "Resource conflict."


class ServerError(AppException):
    """Raised for unexpected server-side errors."""

    status_code = 500
    default_message = "Internal server error."
