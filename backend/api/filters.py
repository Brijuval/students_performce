"""Custom django-filter FilterSets for the Students Performance API."""

import django_filters

from .models import Result, Student, Subject


class StudentFilter(django_filters.FilterSet):
    """Filter students by department, year, status, and name search."""

    name = django_filters.CharFilter(lookup_expr='icontains')
    department = django_filters.CharFilter(lookup_expr='iexact')
    year = django_filters.NumberFilter()
    status = django_filters.CharFilter(lookup_expr='iexact')
    enrolled_after = django_filters.DateFilter(
        field_name='enrollment_date', lookup_expr='gte'
    )
    enrolled_before = django_filters.DateFilter(
        field_name='enrollment_date', lookup_expr='lte'
    )

    class Meta:
        model = Student
        fields = ['name', 'department', 'year', 'status']


class SubjectFilter(django_filters.FilterSet):
    """Filter subjects by name and code."""

    name = django_filters.CharFilter(lookup_expr='icontains')
    code = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Subject
        fields = ['name', 'code']


class ResultFilter(django_filters.FilterSet):
    """Filter results by student, subject, grade, status, and date range."""

    student = django_filters.NumberFilter(field_name='student__id')
    subject = django_filters.NumberFilter(field_name='subject__id')
    grade = django_filters.CharFilter(lookup_expr='iexact')
    status = django_filters.CharFilter(lookup_expr='iexact')
    exam_date_after = django_filters.DateFilter(
        field_name='exam_date', lookup_expr='gte'
    )
    exam_date_before = django_filters.DateFilter(
        field_name='exam_date', lookup_expr='lte'
    )
    min_percentage = django_filters.NumberFilter(
        field_name='percentage', lookup_expr='gte'
    )
    max_percentage = django_filters.NumberFilter(
        field_name='percentage', lookup_expr='lte'
    )

    class Meta:
        model = Result
        fields = ['student', 'subject', 'grade', 'status']
