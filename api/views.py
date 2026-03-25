"""
API views for the Student Performance Management System.
"""

import logging
from django.db.models import Avg, Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Student, Subject, Result
from .serializers import (
    StudentSerializer,
    StudentDetailSerializer,
    SubjectSerializer,
    ResultSerializer,
    AnalyticsSummarySerializer,
)

logger = logging.getLogger(__name__)


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing students.

    Supports CRUD operations plus filtering, search, and analytics.
    """

    queryset = Student.objects.prefetch_related("results__subject").all()
    serializer_class = StudentSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "roll_number", "email", "department"]
    ordering_fields = ["name", "roll_number", "department", "year", "created_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StudentDetailSerializer
        return StudentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        department = self.request.query_params.get("department")
        year = self.request.query_params.get("year")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if department:
            qs = qs.filter(department__icontains=department)
        if year:
            qs = qs.filter(year=year)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"count": queryset.count(), "students": serializer.data})

    @action(detail=True, methods=["get"], url_path="performance")
    def performance(self, request, pk=None):
        """Return individual student performance across all subjects."""
        student = self.get_object()
        results = student.results.select_related("subject").all()
        data = {
            "student_id": student.id,
            "name": student.name,
            "roll_number": student.roll_number,
            "department": student.department,
            "cgpa": student.cgpa,
            "subject_performance": [
                {
                    "subject": r.subject.name,
                    "subject_code": r.subject.subject_code,
                    "marks": r.marks,
                    "grade": r.grade,
                    "status": r.status,
                    "exam_date": r.exam_date,
                }
                for r in results
            ],
        }
        return Response(data)


class SubjectViewSet(viewsets.ModelViewSet):
    """ViewSet for managing subjects."""

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "subject_code"]
    ordering_fields = ["name", "subject_code", "credit", "created_at"]
    ordering = ["name"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ResultViewSet(viewsets.ModelViewSet):
    """ViewSet for managing results."""

    queryset = Result.objects.select_related("student", "subject").all()
    serializer_class = ResultSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["student__name", "student__roll_number", "subject__name"]
    ordering_fields = ["marks", "exam_date", "created_at"]
    ordering = ["-exam_date"]

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get("student")
        subject_id = self.request.query_params.get("subject")
        status_filter = self.request.query_params.get("status")
        grade = self.request.query_params.get("grade")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        roll_number = self.request.query_params.get("roll_number")

        if student_id:
            qs = qs.filter(student_id=student_id)
        if subject_id:
            qs = qs.filter(subject_id=subject_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if grade:
            qs = qs.filter(grade=grade)
        if date_from:
            qs = qs.filter(exam_date__gte=date_from)
        if date_to:
            qs = qs.filter(exam_date__lte=date_to)
        if roll_number:
            qs = qs.filter(student__roll_number=roll_number)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AnalyticsViewSet(viewsets.ViewSet):
    """Analytics endpoints for performance reporting."""

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        """Return overall system statistics."""
        total_students = Student.objects.count()
        total_subjects = Subject.objects.count()
        total_results = Result.objects.count()
        pass_count = Result.objects.filter(status="pass").count()
        fail_count = Result.objects.filter(status="fail").count()
        pass_rate = (pass_count / total_results * 100) if total_results > 0 else 0
        avg_marks = Result.objects.aggregate(avg=Avg("marks"))["avg"] or 0

        students = Student.objects.prefetch_related("results__subject").all()
        cgpa_values = [s.cgpa for s in students if s.results.exists()]
        avg_cgpa = round(sum(cgpa_values) / len(cgpa_values), 2) if cgpa_values else 0

        data = {
            "total_students": total_students,
            "total_subjects": total_subjects,
            "total_results": total_results,
            "pass_count": pass_count,
            "fail_count": fail_count,
            "pass_rate": round(pass_rate, 2),
            "average_marks": round(avg_marks, 2),
            "average_cgpa": avg_cgpa,
        }
        return Response(data)

    @action(detail=False, methods=["get"], url_path="subject-analysis")
    def subject_analysis(self, request):
        """Return average marks per subject."""
        subjects = Subject.objects.annotate(
            avg_marks=Avg("results__marks"),
            result_count=Count("results"),
        ).values("id", "name", "subject_code", "avg_marks", "result_count")

        data = [
            {
                "subject_id": s["id"],
                "subject_name": s["name"],
                "subject_code": s["subject_code"],
                "average_marks": round(s["avg_marks"], 2) if s["avg_marks"] else 0,
                "count": s["result_count"],
            }
            for s in subjects
        ]
        return Response({"all_subject_averages": data})

    @action(detail=False, methods=["get"], url_path="pass-fail")
    def pass_fail(self, request):
        """Return pass/fail statistics per student."""
        students = Student.objects.prefetch_related("results__subject").all()
        data = []
        for student in students:
            results = student.results.all()
            if not results:
                continue
            data.append(
                {
                    "id": student.id,
                    "name": student.name,
                    "roll_number": student.roll_number,
                    "department": student.department,
                    "cgpa": student.cgpa,
                    "status": "Pass" if student.cgpa >= 4.0 else "Fail",
                }
            )
        return Response({"students": data})

    @action(detail=False, methods=["get"], url_path="cgpa-stats")
    def cgpa_stats(self, request):
        """Return CGPA statistics."""
        students = Student.objects.prefetch_related("results__subject").all()
        cgpa_values = [s.cgpa for s in students if s.results.exists()]

        if not cgpa_values:
            return Response(
                {"average_cgpa": 0, "highest_cgpa": 0, "pass_percentage": 0}
            )

        avg_cgpa = sum(cgpa_values) / len(cgpa_values)
        highest_cgpa = max(cgpa_values)
        pass_count = sum(1 for c in cgpa_values if c >= 4.0)
        pass_percentage = (pass_count / len(cgpa_values)) * 100

        return Response(
            {
                "average_cgpa": round(avg_cgpa, 2),
                "highest_cgpa": round(highest_cgpa, 2),
                "pass_percentage": round(pass_percentage, 2),
            }
        )

    @action(detail=False, methods=["get"], url_path="performance/(?P<roll_number>[^/.]+)")
    def student_performance(self, request, roll_number=None):
        """Return individual student performance by roll number."""
        try:
            student = Student.objects.get(roll_number=roll_number)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        results = student.results.select_related("subject").all()
        data = {
            "id": student.id,
            "name": student.name,
            "roll_number": student.roll_number,
            "department": student.department,
            "cgpa": student.cgpa,
            "subject_performance": [
                {
                    "subject": r.subject.name,
                    "subject_code": r.subject.subject_code,
                    "marks": r.marks,
                    "grade": r.grade,
                    "status": r.status,
                    "exam_date": str(r.exam_date),
                }
                for r in results
            ],
        }
        return Response(data)

    @action(detail=False, methods=["get"], url_path="compare")
    def compare_students(self, request):
        """Compare performance of two students by roll number."""
        s1 = request.query_params.get("student1")
        s2 = request.query_params.get("student2")

        if not s1 or not s2:
            return Response(
                {"error": "Both student1 and student2 query params are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        students_data = []
        for roll in [s1, s2]:
            try:
                student = Student.objects.get(roll_number=roll)
                results = student.results.select_related("subject").all()
                students_data.append(
                    {
                        "id": student.id,
                        "name": student.name,
                        "roll_number": student.roll_number,
                        "department": student.department,
                        "subjects": [
                            {
                                "subject": r.subject.name,
                                "marks": r.marks,
                                "grade": r.grade,
                            }
                            for r in results
                        ],
                    }
                )
            except Student.DoesNotExist:
                return Response(
                    {"error": f"Student with roll number '{roll}' not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

        return Response(students_data)
