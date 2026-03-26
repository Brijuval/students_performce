class APIResponse:
    """Standardized API response format"""

    @staticmethod
    def success(data=None, message="Success", status_code=200):
        return {
            'success': True,
            'message': message,
            'data': data,
            'status_code': status_code
        }

    @staticmethod
    def error(message, error_code=None, status_code=400, details=None):
        return {
            'success': False,
            'message': message,
            'error_code': error_code,
            'status_code': status_code,
            'details': details
        }

    @staticmethod
    def paginated(data, total, page, page_size):
        if page_size <= 0:
            raise ValueError("page_size must be greater than 0")
        return {
            'success': True,
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'pages': (total + page_size - 1) // page_size
            }
        }
