from django.contrib import admin
from .models import Student, Subject, Result


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'enrollment_date', 'status', 'created_at']
    list_filter = ['status', 'enrollment_date']
    search_fields = ['name', 'email', 'phone']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'enrollment_date'


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'code', 'description', 'created_at']
    search_fields = ['name', 'code']
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'student', 'subject', 'marks_obtained', 'total_marks',
        'percentage', 'grade', 'status', 'exam_date',
    ]
    list_filter = ['grade', 'status', 'exam_date', 'subject']
    search_fields = ['student__name', 'student__email', 'subject__name', 'subject__code']
    ordering = ['-exam_date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'exam_date'
    raw_id_fields = ['student', 'subject']
