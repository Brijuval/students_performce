"""Grade and marks calculation helpers used by the Result model and API views."""


def calculate_grade(percentage: float) -> str:
    """Return the letter grade corresponding to a percentage score.

    Grading scale:
        A: >= 90
        B: >= 80
        C: >= 70
        D: >= 60
        F:  < 60

    Args:
        percentage: A numeric score between 0 and 100.

    Returns:
        A single letter grade string: 'A', 'B', 'C', 'D', or 'F'.
    """
    if percentage >= 90:
        return 'A'
    elif percentage >= 80:
        return 'B'
    elif percentage >= 70:
        return 'C'
    elif percentage >= 60:
        return 'D'
    else:
        return 'F'


def calculate_percentage(marks_obtained: float, total_marks: float) -> float:
    """Compute the percentage score from raw marks.

    Args:
        marks_obtained: The marks scored by the student.
        total_marks: The maximum possible marks for the exam.

    Returns:
        A float representing the percentage (0–100).
        Returns 0 if ``total_marks`` is zero to avoid division by zero.
    """
    if total_marks == 0:
        return 0
    return (marks_obtained / total_marks) * 100


def get_pass_status(percentage: float, passing_percentage: float = 40) -> str:
    """Determine whether a student passed or failed.

    Args:
        percentage: The student's percentage score.
        passing_percentage: The minimum percentage required to pass (default: 40).

    Returns:
        'pass' if ``percentage`` >= ``passing_percentage``, otherwise 'fail'.
    """
    return 'pass' if percentage >= passing_percentage else 'fail'


def format_date(date_obj) -> str | None:
    """Format a date object to the standard 'YYYY-MM-DD' string.

    Args:
        date_obj: A ``datetime.date`` instance, or ``None``.

    Returns:
        A date string in 'YYYY-MM-DD' format, or ``None`` if input is ``None``.
    """
    return date_obj.strftime('%Y-%m-%d') if date_obj else None


def format_datetime(datetime_obj) -> str | None:
    """Format a datetime object to an ISO 8601 string.

    Args:
        datetime_obj: A ``datetime.datetime`` instance, or ``None``.

    Returns:
        An ISO 8601 formatted string, or ``None`` if input is ``None``.
    """
    return datetime_obj.isoformat() if datetime_obj else None
