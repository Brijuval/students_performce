"""Input validators for the Students Performance API.

Each validator raises ``django.core.exceptions.ValidationError`` when the
supplied value does not meet the expected format or range constraints.
"""

import re
from datetime import datetime

from django.core.exceptions import ValidationError


def validate_email(email: str) -> None:
    """Validate that ``email`` matches a standard email format.

    Args:
        email: The email address string to validate.

    Raises:
        ValidationError: If the email does not match the expected pattern.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError("Invalid email format")


def validate_phone(phone: str) -> None:
    """Validate that ``phone`` is exactly 10 numeric digits.

    Args:
        phone: The phone number string to validate.

    Raises:
        ValidationError: If the phone number is not exactly 10 digits.
    """
    pattern = r'^\d{10}$'
    if not re.match(pattern, phone):
        raise ValidationError("Phone must be 10 digits")


def validate_marks(marks: float, total_marks: float = 100) -> None:
    """Validate that ``marks`` are within the range [0, total_marks].

    Args:
        marks: The marks to validate.
        total_marks: The maximum allowed marks (default: 100).

    Raises:
        ValidationError: If ``marks`` is negative or exceeds ``total_marks``.
    """
    if marks < 0 or marks > total_marks:
        raise ValidationError(f"Marks must be between 0 and {total_marks}")


def validate_percentage(percentage: float) -> None:
    """Validate that ``percentage`` is within the range [0, 100].

    Args:
        percentage: The percentage value to validate.

    Raises:
        ValidationError: If ``percentage`` is outside the 0–100 range.
    """
    if percentage < 0 or percentage > 100:
        raise ValidationError("Percentage must be between 0 and 100")


def validate_enrollment_date(date) -> None:
    """Validate that ``date`` is not in the future.

    Args:
        date: A ``datetime.date`` instance representing the enrollment date.

    Raises:
        ValidationError: If the date is after today.
    """
    if date > datetime.now().date():
        raise ValidationError("Enrollment date cannot be in the future")
