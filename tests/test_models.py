"""
Tests for Django models.
"""

import pytest
from datetime import date
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from api.models import Student, Subject, Result


@pytest.mark.django_db
class TestStudentModel:
    def test_create_student(self, student):
        assert student.id is not None
        assert student.name == "Alice Johnson"
        assert student.roll_number == "CS001"
        assert student.status == "active"

    def test_student_str(self, student):
        assert str(student) == "Alice Johnson (CS001)"

    def test_roll_number_unique(self, student):
        with pytest.raises(IntegrityError):
            Student.objects.create(
                name="Bob",
                roll_number="CS001",
                department="CS",
                year=1,
            )

    def test_cgpa_no_results(self, student):
        assert student.cgpa == 0.0

    def test_cgpa_with_result(self, result, student):
        # Marks 85 → grade point 9, credit 4 → cgpa 9.0
        assert student.cgpa == 9.0


@pytest.mark.django_db
class TestSubjectModel:
    def test_create_subject(self, subject):
        assert subject.id is not None
        assert subject.name == "Mathematics"
        assert subject.subject_code == "MATH101"
        assert subject.credit == 4

    def test_subject_str(self, subject):
        assert str(subject) == "Mathematics (MATH101)"

    def test_subject_code_unique(self, subject):
        with pytest.raises(IntegrityError):
            Subject.objects.create(
                name="Another Math",
                subject_code="MATH101",
                credit=3,
            )


@pytest.mark.django_db
class TestResultModel:
    def test_create_result(self, result):
        assert result.id is not None
        assert result.marks == 85.0
        assert result.grade == "A+"
        assert result.status == "pass"
        assert result.percentage == 85.0

    def test_result_str(self, result, student, subject):
        assert "Alice Johnson" in str(result)
        assert "Mathematics" in str(result)

    def test_fail_status(self, db, student, subject):
        r = Result.objects.create(
            student=student,
            subject=subject,
            marks=30.0,
            exam_date=date(2024, 7, 1),
        )
        assert r.status == "fail"
        assert r.grade == "F"

    def test_unique_together_constraint(self, result, student, subject):
        with pytest.raises(IntegrityError):
            Result.objects.create(
                student=student,
                subject=subject,
                marks=70.0,
                exam_date=date(2024, 6, 15),
            )

    def test_grade_boundaries(self, db, student, subject):
        cases = [
            (90, "O", "pass"),
            (80, "A+", "pass"),
            (70, "A", "pass"),
            (60, "B+", "pass"),
            (50, "B", "pass"),
            (40, "C", "pass"),
            (39, "F", "fail"),
        ]
        for i, (marks, expected_grade, expected_status) in enumerate(cases):
            r = Result.objects.create(
                student=student,
                subject=subject,
                marks=marks,
                exam_date=date(2024, 1, i + 1),
            )
            assert r.grade == expected_grade, f"marks={marks}"
            assert r.status == expected_status, f"marks={marks}"
