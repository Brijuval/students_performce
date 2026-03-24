"""ViewSets and API views for the Students Performance application."""

import logging

from django.db.models import Avg, Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import ResultFilter, StudentFilter, SubjectFilter
from .models import Result, Student, Subject
from .pagination import StandardResultsPagination
from .serializers import (
    AnalyticsSerializer,
    ResultDetailSerializer,
    ResultSerializer,
    StudentSerializer,
    SubjectSerializer,
)

logger = logging.getLogger(__name__)


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for students.

    list:   GET  /api/students/
    create: POST /api/students/
    retrieve: GET /api/students/{id}/
    update: PUT  /api/students/{id}/
    partial_update: PATCH /api/students/{id}/
    destroy: DELETE /api/students/{id}/
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    pagination_class = StandardResultsPagination
    filterset_class = StudentFilter
    search_fields = ['name', 'email', 'roll_number', 'department']
    ordering_fields = ['name', 'department', 'year', 'created_at']
    ordering = ['name']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        logger.info("Listed students | count=%s", response.data.get('count', 0))
        return response

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        logger.info("Created student | id=%s", response.data.get('id'))
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        logger.info("Updated student | id=%s", response.data.get('id'))
        return response

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info("Deleting student | id=%s name=%s", instance.pk, instance.name)
        return super().destroy(request, *args, **kwargs)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for subjects.

    list:   GET  /api/subjects/
    create: POST /api/subjects/
    retrieve: GET /api/subjects/{id}/
    update: PUT  /api/subjects/{id}/
    partial_update: PATCH /api/subjects/{id}/
    destroy: DELETE /api/subjects/{id}/
    """

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    pagination_class = StandardResultsPagination
    filterset_class = SubjectFilter
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']


class ResultViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for results.

    list:   GET  /api/results/
    create: POST /api/results/
    retrieve: GET /api/results/{id}/
    update: PUT  /api/results/{id}/
    partial_update: PATCH /api/results/{id}/
    destroy: DELETE /api/results/{id}/
    """

    queryset = Result.objects.select_related('student', 'subject').all()
    pagination_class = StandardResultsPagination
    filterset_class = ResultFilter
    search_fields = ['student__name', 'student__roll_number', 'subject__name', 'subject__code']
    ordering_fields = ['exam_date', 'percentage', 'grade', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('retrieve', 'list'):
            return ResultDetailSerializer
        return ResultSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        logger.info("Created result | id=%s", response.data.get('id'))
        return response


class AnalyticsViewSet(viewsets.ViewSet):
    """
    Read-only ViewSet providing aggregated analytics.

    GET /api/analytics/          – overall summary
    GET /api/analytics/subjects/ – per-subject averages
    GET /api/analytics/students/ – per-student summary
    """

    @action(detail=False, methods=['get'], url_path='', url_name='overview')
    def overview(self, request):
        total_students = Student.objects.count()
        total_subjects = Subject.objects.count()
        total_results = Result.objects.count()

        pass_count = Result.objects.filter(status=Result.STATUS_PASS).count()
        overall_pass_rate = (
            round(pass_count / total_results * 100, 2) if total_results else 0.0
        )

        avg_pct = Result.objects.aggregate(avg=Avg('percentage'))['avg'] or 0.0
        average_percentage = round(avg_pct, 2)

        grade_dist = {
            grade: Result.objects.filter(grade=grade).count()
            for grade, _ in Result.GRADE_CHOICES
        }

        subject_averages = list(
            Result.objects.values('subject__name', 'subject__code')
            .annotate(
                average_percentage=Avg('percentage'),
                total_results=Count('id'),
                pass_count=Count('id', filter=Q(status=Result.STATUS_PASS)),
            )
            .order_by('subject__name')
        )
        for item in subject_averages:
            item['average_percentage'] = round(item['average_percentage'] or 0.0, 2)
            item['pass_rate'] = round(
                item['pass_count'] / item['total_results'] * 100
                if item['total_results']
                else 0.0,
                2,
            )

        data = {
            'total_students': total_students,
            'total_subjects': total_subjects,
            'total_results': total_results,
            'overall_pass_rate': overall_pass_rate,
            'average_percentage': average_percentage,
            'grade_distribution': grade_dist,
            'subject_averages': subject_averages,
        }
        serializer = AnalyticsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='subjects')
    def subjects(self, request):
        """Per-subject performance breakdown."""
        subject_data = list(
            Result.objects.values('subject__id', 'subject__name', 'subject__code')
            .annotate(
                average_percentage=Avg('percentage'),
                total_results=Count('id'),
                pass_count=Count('id', filter=Q(status=Result.STATUS_PASS)),
            )
            .order_by('subject__name')
        )
        for item in subject_data:
            item['average_percentage'] = round(item['average_percentage'] or 0.0, 2)
            item['pass_rate'] = round(
                item['pass_count'] / item['total_results'] * 100
                if item['total_results']
                else 0.0,
                2,
            )
        return Response({'subjects': subject_data})

    @action(detail=False, methods=['get'], url_path='students')
    def students(self, request):
        """Per-student performance summary."""
        student_data = list(
            Result.objects.values(
                'student__id', 'student__name', 'student__roll_number', 'student__department'
            )
            .annotate(
                average_percentage=Avg('percentage'),
                total_results=Count('id'),
                pass_count=Count('id', filter=Q(status=Result.STATUS_PASS)),
            )
            .order_by('student__name')
        )
        for item in student_data:
            item['average_percentage'] = round(item['average_percentage'] or 0.0, 2)
            item['pass_rate'] = round(
                item['pass_count'] / item['total_results'] * 100
                if item['total_results']
                else 0.0,
                2,
            )
        return Response({'students': student_data})
