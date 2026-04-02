from rest_framework import serializers
from .models import Student, Subject, Result


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_code(self, value):
        return value.upper()


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = Result
        fields = [
            'id', 'student', 'student_name', 'subject', 'subject_name',
            'subject_code', 'marks_obtained', 'total_marks', 'percentage',
            'grade', 'status', 'exam_date', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        marks_obtained = data.get('marks_obtained')
        total_marks = data.get('total_marks', 100)

        if marks_obtained is not None and total_marks is not None:
            if marks_obtained < 0:
                raise serializers.ValidationError({'marks_obtained': 'Marks obtained cannot be negative.'})
            if marks_obtained > total_marks:
                raise serializers.ValidationError(
                    {'marks_obtained': 'Marks obtained cannot exceed total marks.'}
                )
            # Auto-calculate percentage, grade, and status if not provided
            percentage = (marks_obtained / total_marks) * 100
            data['percentage'] = round(percentage, 2)
            data['grade'] = self._calculate_grade(percentage)
            data['status'] = 'pass' if percentage >= 40 else 'fail'

        return data

    @staticmethod
    def _calculate_grade(percentage):
        if percentage >= 90:
            return 'A'
        elif percentage >= 75:
            return 'B'
        elif percentage >= 60:
            return 'C'
        elif percentage >= 40:
            return 'D'
        return 'F'


class ResultSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for nested result lists."""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)

    class Meta:
        model = Result
        fields = [
            'id', 'subject', 'subject_name', 'subject_code',
            'marks_obtained', 'total_marks', 'percentage',
            'grade', 'status', 'exam_date',
        ]


class StudentSerializer(serializers.ModelSerializer):
    results = ResultSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'name', 'email', 'phone', 'enrollment_date',
            'status', 'created_at', 'updated_at', 'results',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_email(self, value):
        return value.lower()

    def validate_phone(self, value):
        digits = ''.join(filter(str.isdigit, value))
        if len(digits) < 7:
            raise serializers.ValidationError('Phone number must have at least 7 digits.')
        return value


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (no nested results)."""

    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'phone', 'enrollment_date', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']


class AnalyticsSerializer(serializers.Serializer):
    """Serializer for analytics/summary data."""
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    inactive_students = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
    total_results = serializers.IntegerField()
    overall_pass_rate = serializers.FloatField()
    average_percentage = serializers.FloatField()


class StudentPerformanceSerializer(serializers.Serializer):
    """Serializer for individual student performance."""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    email = serializers.EmailField()
    total_exams = serializers.IntegerField()
    passed = serializers.IntegerField()
    failed = serializers.IntegerField()
    average_percentage = serializers.FloatField()
    highest_percentage = serializers.FloatField()
    lowest_percentage = serializers.FloatField()
    results = ResultSummarySerializer(many=True)


class SubjectPerformanceSerializer(serializers.Serializer):
    """Serializer for individual subject performance."""
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    subject_code = serializers.CharField()
    total_students = serializers.IntegerField()
    passed = serializers.IntegerField()
    failed = serializers.IntegerField()
    pass_rate = serializers.FloatField()
    average_percentage = serializers.FloatField()
    highest_percentage = serializers.FloatField()
    lowest_percentage = serializers.FloatField()


class ClassReportSerializer(serializers.Serializer):
    """Serializer for class-wide report."""
    total_students = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
    total_results = serializers.IntegerField()
    overall_pass_rate = serializers.FloatField()
    overall_fail_rate = serializers.FloatField()
    average_percentage = serializers.FloatField()
    grade_distribution = serializers.DictField(child=serializers.IntegerField())
    top_performers = StudentListSerializer(many=True)
    subject_averages = SubjectPerformanceSerializer(many=True)
