"""
Django admin configuration for the Student Performance Management System.
"""

from django.contrib import admin
from .models import Student, Subject, Result


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["name", "roll_number", "department", "year", "status", "created_at"]
    list_filter = ["status", "department", "year"]
    search_fields = ["name", "roll_number", "email"]
    readonly_fields = ["enrollment_date", "created_at", "updated_at"]
    ordering = ["name"]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "subject_code", "credit", "created_at"]
    search_fields = ["name", "subject_code"]
    ordering = ["name"]


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "subject",
        "marks",
        "percentage",
        "grade",
        "status",
        "exam_date",
    ]
    list_filter = ["status", "grade", "subject", "exam_date"]
    search_fields = ["student__name", "student__roll_number", "subject__name"]
    readonly_fields = ["percentage", "grade", "status", "created_at", "updated_at"]
    ordering = ["-exam_date"]
