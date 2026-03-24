"""DRF serializers for the Students Performance API."""

from rest_framework import serializers

from .models import Result, Student, Subject


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for the Student model."""

    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'roll_number',
            'department',
            'year',
            'enrollment_date',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_year(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Year must be between 1 and 10.")
        return value


class SubjectSerializer(serializers.ModelSerializer):
    """Serializer for the Subject model."""

    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'credit', 'created_at']
        read_only_fields = ['id', 'created_at']


class ResultSerializer(serializers.ModelSerializer):
    """Serializer for the Result model (write operations use IDs)."""

    class Meta:
        model = Result
        fields = [
            'id',
            'student',
            'subject',
            'marks_obtained',
            'total_marks',
            'percentage',
            'grade',
            'status',
            'exam_date',
            'created_at',
        ]
        read_only_fields = ['id', 'percentage', 'grade', 'status', 'created_at']

    def validate(self, data):
        marks = data.get('marks_obtained')
        total = data.get('total_marks', 100.0)
        if marks is not None and total is not None and marks > total:
            raise serializers.ValidationError(
                "marks_obtained cannot exceed total_marks."
            )
        return data


class ResultDetailSerializer(ResultSerializer):
    """Result serializer with nested student and subject details."""

    student = StudentSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)

    class Meta(ResultSerializer.Meta):
        pass


class AnalyticsSerializer(serializers.Serializer):
    """Serializer for analytics response data (read-only)."""

    total_students = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
    total_results = serializers.IntegerField()
    overall_pass_rate = serializers.FloatField()
    average_percentage = serializers.FloatField()
    grade_distribution = serializers.DictField(child=serializers.IntegerField())
    subject_averages = serializers.ListField(child=serializers.DictField())
