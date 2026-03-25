class APIException(Exception):
    """Base exception for API"""
    def __init__(self, message, status_code=500, error_code=None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code


class ValidationError(APIException):
    """Validation error - 400"""
    def __init__(self, message, field=None):
        super().__init__(message, 400, 'VALIDATION_ERROR')
        self.field = field


class NotFoundError(APIException):
    """Resource not found - 404"""
    def __init__(self, resource):
        message = f"{resource} not found"
        super().__init__(message, 404, 'NOT_FOUND')


class UnauthorizedError(APIException):
    """Unauthorized - 401"""
    def __init__(self, message="Unauthorized"):
        super().__init__(message, 401, 'UNAUTHORIZED')


class ForbiddenError(APIException):
    """Forbidden - 403"""
    def __init__(self, message="Forbidden"):
        super().__init__(message, 403, 'FORBIDDEN')


class ConflictError(APIException):
    """Conflict - 409"""
    def __init__(self, message="Conflict"):
        super().__init__(message, 409, 'CONFLICT')


class ServerError(APIException):
    """Server error - 500"""
    def __init__(self, message="Internal server error"):
        super().__init__(message, 500, 'SERVER_ERROR')
