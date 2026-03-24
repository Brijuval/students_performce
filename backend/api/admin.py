"""Django admin configuration for the Students Performance application."""

from django.contrib import admin

from .models import Result, Student, Subject


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'roll_number', 'department', 'year', 'status', 'created_at']
    list_filter = ['department', 'year', 'status']
    search_fields = ['name', 'email', 'roll_number']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'phone'),
        }),
        ('Academic Information', {
            'fields': ('roll_number', 'department', 'year', 'enrollment_date', 'status'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'credit', 'created_at']
    search_fields = ['name', 'code']
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'subject', 'marks_obtained', 'total_marks',
        'percentage', 'grade', 'status', 'exam_date',
    ]
    list_filter = ['grade', 'status', 'exam_date', 'subject']
    search_fields = ['student__name', 'student__roll_number', 'subject__name']
    ordering = ['-exam_date']
    readonly_fields = ['percentage', 'grade', 'status', 'created_at']
    raw_id_fields = ['student', 'subject']
