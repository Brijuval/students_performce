import logging
from django.db.models import Avg, Count, Max, Min, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Student, Subject, Result
from .serializers import (
    StudentSerializer,
    StudentListSerializer,
    SubjectSerializer,
    ResultSerializer,
    AnalyticsSerializer,
    StudentPerformanceSerializer,
    SubjectPerformanceSerializer,
    ClassReportSerializer,
)
from .filters import StudentFilter, SubjectFilter, ResultFilter

logger = logging.getLogger(__name__)


class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing students.

    Supports CRUD operations plus filtering by status and searching by
    name, email, and phone.
    """

    queryset = Student.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = StudentFilter
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['enrollment_date', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer

    def create(self, request, *args, **kwargs):
        serializer = StudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        logger.info('Student created: id=%s name=%s', instance.pk, instance.name)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        student_id = instance.pk
        instance.delete()
        logger.info('Student deleted: id=%s', student_id)
        return Response(
            {'message': 'Student deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class SubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subjects.

    Supports CRUD operations plus searching by name and code.
    """

    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = SubjectFilter
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        subject_id = instance.pk
        instance.delete()
        logger.info('Subject deleted: id=%s', subject_id)
        return Response(
            {'message': 'Subject deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class ResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing results.

    Supports CRUD operations plus filtering by student, subject, date range,
    grade, and status.  Auto-calculates percentage, grade, and pass/fail
    status from marks if not supplied.
    """

    queryset = Result.objects.select_related('student', 'subject').all()
    serializer_class = ResultSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ResultFilter
    search_fields = ['student__name', 'subject__name', 'subject__code']
    ordering_fields = ['exam_date', 'percentage', 'created_at']
    ordering = ['-exam_date']

    def create(self, request, *args, **kwargs):
        serializer = ResultSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        logger.info('Result created: id=%s student=%s', instance.pk, instance.student_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        result_id = instance.pk
        instance.delete()
        logger.info('Result deleted: id=%s', result_id)
        return Response(
            {'message': 'Result deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for analytics endpoints.

    Read-only endpoints that compute performance metrics.
    """

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Overall statistics across students, subjects, and results."""
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='active').count()
        inactive_students = Student.objects.filter(status='inactive').count()
        total_subjects = Subject.objects.count()
        total_results = Result.objects.count()

        pass_count = Result.objects.filter(status='pass').count()
        overall_pass_rate = (pass_count / total_results * 100) if total_results else 0.0
        avg_percentage = Result.objects.aggregate(avg=Avg('percentage'))['avg'] or 0.0

        data = {
            'total_students': total_students,
            'active_students': active_students,
            'inactive_students': inactive_students,
            'total_subjects': total_subjects,
            'total_results': total_results,
            'overall_pass_rate': round(overall_pass_rate, 2),
            'average_percentage': round(avg_percentage, 2),
        }
        serializer = AnalyticsSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'student-performance/(?P<student_id>\d+)')
    def student_performance(self, request, student_id=None):
        """Detailed performance for a specific student."""
        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            return Response(
                {'error': True, 'message': f'Student with id {student_id} not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        results = Result.objects.filter(student=student).select_related('subject')
        aggregates = results.aggregate(
            avg=Avg('percentage'),
            highest=Max('percentage'),
            lowest=Min('percentage'),
        )

        data = {
            'student_id': student.pk,
            'student_name': student.name,
            'email': student.email,
            'total_exams': results.count(),
            'passed': results.filter(status='pass').count(),
            'failed': results.filter(status='fail').count(),
            'average_percentage': round(aggregates['avg'] or 0.0, 2),
            'highest_percentage': round(aggregates['highest'] or 0.0, 2),
            'lowest_percentage': round(aggregates['lowest'] or 0.0, 2),
            'results': results,
        }
        serializer = StudentPerformanceSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'subject-performance/(?P<subject_id>\d+)')
    def subject_performance(self, request, subject_id=None):
        """Performance of all students in a specific subject."""
        try:
            subject = Subject.objects.get(pk=subject_id)
        except Subject.DoesNotExist:
            return Response(
                {'error': True, 'message': f'Subject with id {subject_id} not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        results = Result.objects.filter(subject=subject)
        aggregates = results.aggregate(
            avg=Avg('percentage'),
            highest=Max('percentage'),
            lowest=Min('percentage'),
        )
        total = results.count()
        passed = results.filter(status='pass').count()

        data = {
            'subject_id': subject.pk,
            'subject_name': subject.name,
            'subject_code': subject.code,
            'total_students': total,
            'passed': passed,
            'failed': total - passed,
            'pass_rate': round((passed / total * 100) if total else 0.0, 2),
            'average_percentage': round(aggregates['avg'] or 0.0, 2),
            'highest_percentage': round(aggregates['highest'] or 0.0, 2),
            'lowest_percentage': round(aggregates['lowest'] or 0.0, 2),
        }
        serializer = SubjectPerformanceSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='class-report')
    def class_report(self, request):
        """Class-wide report with pass/fail rates and grade distribution."""
        total_students = Student.objects.count()
        total_subjects = Subject.objects.count()
        total_results = Result.objects.count()

        pass_count = Result.objects.filter(status='pass').count()
        fail_count = total_results - pass_count
        pass_rate = round((pass_count / total_results * 100) if total_results else 0.0, 2)
        fail_rate = round((fail_count / total_results * 100) if total_results else 0.0, 2)
        avg_percentage = round(
            Result.objects.aggregate(avg=Avg('percentage'))['avg'] or 0.0, 2
        )

        # Grade distribution
        grade_dist = {}
        for grade_val, _ in Result.GRADE_CHOICES:
            grade_dist[grade_val] = Result.objects.filter(grade=grade_val).count()

        # Top performers: students with highest average percentage (top 5)
        top_student_ids = (
            Result.objects
            .values('student_id')
            .annotate(avg_pct=Avg('percentage'))
            .order_by('-avg_pct')[:5]
            .values_list('student_id', flat=True)
        )
        top_performers = Student.objects.filter(pk__in=top_student_ids)

        # Subject averages
        subject_stats = []
        for subject in Subject.objects.all():
            results = Result.objects.filter(subject=subject)
            total = results.count()
            passed = results.filter(status='pass').count()
            aggregates = results.aggregate(
                avg=Avg('percentage'),
                highest=Max('percentage'),
                lowest=Min('percentage'),
            )
            subject_stats.append({
                'subject_id': subject.pk,
                'subject_name': subject.name,
                'subject_code': subject.code,
                'total_students': total,
                'passed': passed,
                'failed': total - passed,
                'pass_rate': round((passed / total * 100) if total else 0.0, 2),
                'average_percentage': round(aggregates['avg'] or 0.0, 2),
                'highest_percentage': round(aggregates['highest'] or 0.0, 2),
                'lowest_percentage': round(aggregates['lowest'] or 0.0, 2),
            })

        data = {
            'total_students': total_students,
            'total_subjects': total_subjects,
            'total_results': total_results,
            'overall_pass_rate': pass_rate,
            'overall_fail_rate': fail_rate,
            'average_percentage': avg_percentage,
            'grade_distribution': grade_dist,
            'top_performers': top_performers,
            'subject_averages': subject_stats,
        }
        serializer = ClassReportSerializer(data)
        return Response(serializer.data)
