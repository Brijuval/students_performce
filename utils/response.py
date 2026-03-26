"""Standardized API response builder for the Students Performance API.

Use ``APIResponse`` in views and decorators to ensure every endpoint returns
a consistent JSON envelope so clients can rely on a predictable structure.
"""


class APIResponse:
    """Factory for building structured API response dictionaries.

    All methods are static and return plain dicts that can be passed directly
    to ``JsonResponse`` or a DRF ``Response``.

    Response envelope shape:
        success responses:  {"success": true, "message": "...", "data": ...}
        error responses:    {"success": false, "message": "...", "error_code": "...", ...}
        paginated responses: {"success": true, "data": [...], "pagination": {...}}
    """

    @staticmethod
    def success(data=None, message: str = "Success", status_code: int = 200) -> dict:
        """Build a successful response envelope.

        Args:
            data: The payload to include in the response (list, dict, or None).
            message: A human-readable success message.
            status_code: The HTTP status code (for informational purposes only;
                the caller is responsible for setting the actual HTTP status).

        Returns:
            A dict with keys ``success``, ``message``, ``data``, ``status_code``.
        """
        return {
            'success': True,
            'message': message,
            'data': data,
            'status_code': status_code
        }

    @staticmethod
    def error(
        message: str,
        error_code: str | None = None,
        status_code: int = 400,
        details=None,
    ) -> dict:
        """Build an error response envelope.

        Args:
            message: A human-readable error description.
            error_code: A machine-readable error code (e.g., 'NOT_FOUND').
            status_code: The HTTP status code being returned.
            details: Optional additional context (validation field errors, etc.).

        Returns:
            A dict with keys ``success``, ``message``, ``error_code``,
            ``status_code``, and ``details``.
        """
        return {
            'success': False,
            'message': message,
            'error_code': error_code,
            'status_code': status_code,
            'details': details
        }

    @staticmethod
    def paginated(data, total: int, page: int, page_size: int) -> dict:
        """Build a paginated response envelope.

        Args:
            data: The current page of results.
            total: Total number of records across all pages.
            page: The current page number (1-based).
            page_size: The number of records per page. Must be > 0.

        Returns:
            A dict with keys ``success``, ``data``, and ``pagination``
            (containing ``total``, ``page``, ``page_size``, and ``pages``).

        Raises:
            ValueError: If ``page_size`` is not a positive integer.
        """
        if page_size <= 0:
            raise ValueError("page_size must be greater than 0")
        return {
            'success': True,
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                # Ceiling division to calculate total pages
                'pages': (total + page_size - 1) // page_size
            }
        }
