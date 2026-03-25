def calculate_grade(percentage):
    """Calculate grade based on percentage"""
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


def calculate_percentage(marks_obtained, total_marks):
    """Calculate percentage from marks"""
    if total_marks == 0:
        return 0
    return (marks_obtained / total_marks) * 100


def get_pass_status(percentage, passing_percentage=40):
    """Get pass/fail status"""
    return 'pass' if percentage >= passing_percentage else 'fail'


def format_date(date_obj):
    """Format date to standard format"""
    return date_obj.strftime('%Y-%m-%d') if date_obj else None


def format_datetime(datetime_obj):
    """Format datetime to ISO format"""
    return datetime_obj.isoformat() if datetime_obj else None
