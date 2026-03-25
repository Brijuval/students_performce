"""
Pytest configuration and shared fixtures.
"""

import pytest
from datetime import date
from django.contrib.auth.models import User

from api.models import Student, Subject, Result


@pytest.fixture
def student(db):
    return Student.objects.create(
        name="Alice Johnson",
        roll_number="CS001",
        email="alice@example.com",
        department="Computer Science",
        year=2,
    )


@pytest.fixture
def subject(db):
    return Subject.objects.create(
        name="Mathematics",
        subject_code="MATH101",
        credit=4,
    )


@pytest.fixture
def result(db, student, subject):
    return Result.objects.create(
        student=student,
        subject=subject,
        marks=85.0,
        exam_date=date(2024, 6, 15),
    )


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()
