import re
from datetime import datetime

from django.core.exceptions import ValidationError


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")


def validate_phone(phone):
    """Validate phone number"""
    pattern = r'^\d{10}$'
    if not re.match(pattern, phone):
        raise ValidationError("Phone must be 10 digits")


def validate_marks(marks, total_marks=100):
    """Validate marks are within range"""
    if marks < 0 or marks > total_marks:
        raise ValidationError(f"Marks must be between 0 and {total_marks}")


def validate_percentage(percentage):
    """Validate percentage is 0-100"""
    if percentage < 0 or percentage > 100:
        raise ValidationError("Percentage must be between 0 and 100")


def validate_enrollment_date(date):
    """Validate enrollment date is not in future"""
    if date > datetime.now().date():
        raise ValidationError("Enrollment date cannot be in the future")
