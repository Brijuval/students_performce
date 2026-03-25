"""
Helper functions for the Student Performance Management System.
"""

from datetime import date


def calculate_grade(marks):
    """Return letter grade based on marks out of 100."""
    if marks >= 90:
        return "O"
    if marks >= 80:
        return "A+"
    if marks >= 70:
        return "A"
    if marks >= 60:
        return "B+"
    if marks >= 50:
        return "B"
    if marks >= 40:
        return "C"
    return "F"


def calculate_grade_point(marks):
    """Return numeric grade point (10-point scale) for given marks."""
    if marks >= 90:
        return 10
    if marks >= 80:
        return 9
    if marks >= 70:
        return 8
    if marks >= 60:
        return 7
    if marks >= 50:
        return 6
    if marks >= 40:
        return 5
    return 0


def calculate_percentage(marks, total_marks=100):
    """Return percentage from marks and total marks."""
    if total_marks <= 0:
        raise ValueError("total_marks must be greater than 0")
    return round((marks / total_marks) * 100, 2)


def calculate_cgpa(results):
    """
    Calculate CGPA from a list of result dicts with 'marks' and 'credits' keys.

    Args:
        results: iterable of dicts with 'marks' (float) and 'credits' (int)

    Returns:
        float CGPA on a 10-point scale
    """
    total_weighted = 0
    total_credits = 0
    for r in results:
        gp = calculate_grade_point(r["marks"])
        credits = r.get("credits", 1)
        total_weighted += gp * credits
        total_credits += credits
    return round(total_weighted / total_credits, 2) if total_credits > 0 else 0.0


def is_pass(marks, pass_mark=40):
    """Return True if marks are at or above the pass mark."""
    return marks >= pass_mark


def format_date(d):
    """Return ISO 8601 string for a date object, or None."""
    if d is None:
        return None
    if isinstance(d, date):
        return d.isoformat()
    return str(d)
