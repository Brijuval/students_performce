import django_filters
from .models import Student, Result, Subject


class StudentFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Student.STATUS_CHOICES)
    enrollment_date_from = django_filters.DateFilter(field_name='enrollment_date', lookup_expr='gte')
    enrollment_date_to = django_filters.DateFilter(field_name='enrollment_date', lookup_expr='lte')

    class Meta:
        model = Student
        fields = ['status']


class SubjectFilter(django_filters.FilterSet):
    class Meta:
        model = Subject
        fields = ['name', 'code']


class ResultFilter(django_filters.FilterSet):
    student_id = django_filters.NumberFilter(field_name='student__id')
    subject_id = django_filters.NumberFilter(field_name='subject__id')
    grade = django_filters.ChoiceFilter(choices=Result.GRADE_CHOICES)
    status = django_filters.ChoiceFilter(choices=Result.STATUS_CHOICES)
    exam_date_from = django_filters.DateFilter(field_name='exam_date', lookup_expr='gte')
    exam_date_to = django_filters.DateFilter(field_name='exam_date', lookup_expr='lte')

    class Meta:
        model = Result
        fields = ['student_id', 'subject_id', 'grade', 'status']
