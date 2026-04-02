"""
Custom validators for the Student Performance Management System.
"""

import re
from datetime import date

from django.core.exceptions import ValidationError


def validate_email(email):
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise ValidationError(f"'{email}' is not a valid email address.")
    return email


def validate_phone(phone):
    """Validate phone number (digits, optional leading +, 7–15 chars)."""
    pattern = r"^\+?[0-9]{7,15}$"
    if not re.match(pattern, phone):
        raise ValidationError(f"'{phone}' is not a valid phone number.")
    return phone


def validate_marks(marks):
    """Validate marks are in the range [0, 100]."""
    try:
        marks = float(marks)
    except (TypeError, ValueError):
        raise ValidationError("Marks must be a numeric value.")
    if not (0 <= marks <= 100):
        raise ValidationError("Marks must be between 0 and 100.")
    return marks


def validate_date_not_future(value):
    """Validate that a date is not in the future."""
    if isinstance(value, date) and value > date.today():
        raise ValidationError("Date cannot be in the future.")
    return value


def validate_roll_number(value):
    """Validate roll number format (alphanumeric, 2–20 chars)."""
    pattern = r"^[A-Za-z0-9\-_]{2,20}$"
    if not re.match(pattern, str(value)):
        raise ValidationError(
            "Roll number must be 2–20 alphanumeric characters (hyphens and underscores allowed)."
        )
    return value
