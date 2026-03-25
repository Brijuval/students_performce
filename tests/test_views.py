"""
Tests for API views (students, subjects, results, analytics).
"""

import pytest
from datetime import date
from django.urls import reverse

from api.models import Student, Subject, Result


@pytest.mark.django_db
class TestStudentAPI:
    def test_list_students(self, api_client, student):
        url = "/api/students/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        # Response is paginated: {"count": ..., "results": [...]} or custom {"count": ..., "students": [...]}
        students = data.get("students") or data.get("results") or []
        assert data["count"] == 1
        assert students[0]["roll_number"] == "CS001"

    def test_create_student(self, api_client, db):
        url = "/api/students/"
        payload = {
            "name": "Bob Smith",
            "roll_number": "CS002",
            "department": "Physics",
            "year": 1,
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 201
        assert Student.objects.filter(roll_number="CS002").exists()

    def test_retrieve_student(self, api_client, student):
        url = f"/api/students/{student.id}/"
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.json()["roll_number"] == "CS001"

    def test_update_student(self, api_client, student):
        url = f"/api/students/{student.id}/"
        response = api_client.patch(url, {"department": "Engineering"}, format="json")
        assert response.status_code == 200
        student.refresh_from_db()
        assert student.department == "Engineering"

    def test_delete_student(self, api_client, student):
        url = f"/api/students/{student.id}/"
        response = api_client.delete(url)
        assert response.status_code == 204
        assert not Student.objects.filter(id=student.id).exists()

    def test_duplicate_roll_number_rejected(self, api_client, student):
        url = "/api/students/"
        payload = {
            "name": "Charlie",
            "roll_number": "CS001",
            "department": "CS",
            "year": 2,
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_filter_by_status(self, api_client, student):
        url = "/api/students/?status=active"
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.json()["count"] == 1

    def test_search_by_name(self, api_client, student):
        url = "/api/students/?search=Alice"
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.json()["count"] == 1

    def test_student_performance_action(self, api_client, result, student):
        url = f"/api/students/{student.id}/performance/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data["roll_number"] == "CS001"
        assert len(data["subject_performance"]) == 1


@pytest.mark.django_db
class TestSubjectAPI:
    def test_list_subjects(self, api_client, subject):
        url = "/api/subjects/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        # Response may be a list or paginated dict
        subjects = data if isinstance(data, list) else data.get("results", [])
        assert any(s["subject_code"] == "MATH101" for s in subjects)

    def test_create_subject(self, api_client, db):
        url = "/api/subjects/"
        payload = {"name": "Physics", "subject_code": "PHY101", "credit": 3}
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 201

    def test_duplicate_subject_code_rejected(self, api_client, subject):
        url = "/api/subjects/"
        payload = {"name": "Algebra", "subject_code": "MATH101", "credit": 3}
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestResultAPI:
    def test_list_results(self, api_client, result):
        url = "/api/results/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        results = data if isinstance(data, list) else data.get("results", [])
        assert len(results) == 1

    def test_create_result(self, api_client, student, subject):
        url = "/api/results/"
        payload = {
            "student": student.id,
            "subject": subject.id,
            "marks": 75.0,
            "exam_date": "2024-09-01",
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["grade"] == "A"
        assert data["status"] == "pass"

    def test_invalid_marks_rejected(self, api_client, student, subject):
        url = "/api/results/"
        payload = {
            "student": student.id,
            "subject": subject.id,
            "marks": 150.0,
            "exam_date": "2024-10-01",
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_filter_by_status(self, api_client, result):
        url = "/api/results/?status=pass"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        results = data if isinstance(data, list) else data.get("results", [])
        assert all(r["status"] == "pass" for r in results)


@pytest.mark.django_db
class TestAnalyticsAPI:
    def test_summary(self, api_client, result):
        url = "/api/analytics/summary/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "pass_rate" in data

    def test_subject_analysis(self, api_client, result):
        url = "/api/analytics/subject-analysis/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert "all_subject_averages" in data

    def test_pass_fail(self, api_client, result):
        url = "/api/analytics/pass-fail/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert "students" in data

    def test_cgpa_stats(self, api_client, result):
        url = "/api/analytics/cgpa-stats/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert "average_cgpa" in data
        assert "highest_cgpa" in data
        assert "pass_percentage" in data

    def test_student_performance_by_roll(self, api_client, result, student):
        url = f"/api/analytics/performance/{student.roll_number}/"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data["roll_number"] == "CS001"

    def test_compare_students(self, api_client, db):
        s1 = Student.objects.create(
            name="Tom", roll_number="S001", department="CS", year=1
        )
        s2 = Student.objects.create(
            name="Jerry", roll_number="S002", department="CS", year=1
        )
        subj = Subject.objects.create(name="Math", subject_code="M001", credit=3)
        Result.objects.create(student=s1, subject=subj, marks=80, exam_date=date(2024, 1, 1))
        Result.objects.create(student=s2, subject=subj, marks=60, exam_date=date(2024, 1, 1))

        url = "/api/analytics/compare/?student1=S001&student2=S002"
        response = api_client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
