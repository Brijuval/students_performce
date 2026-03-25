"""
Serializers for the Student Performance Management System API.
"""

from rest_framework import serializers
from .models import Student, Subject, Result


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name", "subject_code", "description", "credit", "created_at"]
        read_only_fields = ["id", "created_at"]


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    student_roll = serializers.CharField(source="student.roll_number", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    subject_code = serializers.CharField(source="subject.subject_code", read_only=True)

    class Meta:
        model = Result
        fields = [
            "id",
            "student",
            "student_name",
            "student_roll",
            "subject",
            "subject_name",
            "subject_code",
            "marks",
            "total_marks",
            "percentage",
            "grade",
            "status",
            "exam_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "percentage",
            "grade",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_marks(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Marks must be between 0 and 100.")
        return value

    def validate(self, data):
        student = data.get("student")
        subject = data.get("subject")
        exam_date = data.get("exam_date")
        instance = self.instance

        if student and subject and exam_date:
            qs = Result.objects.filter(
                student=student, subject=subject, exam_date=exam_date
            )
            if instance:
                qs = qs.exclude(pk=instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    "A result for this student and subject on this date already exists."
                )
        return data


class StudentSerializer(serializers.ModelSerializer):
    cgpa = serializers.FloatField(read_only=True)
    results_count = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "roll_number",
            "email",
            "phone",
            "department",
            "year",
            "enrollment_date",
            "status",
            "cgpa",
            "results_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "enrollment_date", "created_at", "updated_at"]

    def get_results_count(self, obj):
        return obj.results.count()

    def validate_roll_number(self, value):
        instance = self.instance
        qs = Student.objects.filter(roll_number=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This roll number is already taken.")
        return value


class StudentDetailSerializer(StudentSerializer):
    results = ResultSerializer(many=True, read_only=True)

    class Meta(StudentSerializer.Meta):
        fields = StudentSerializer.Meta.fields + ["results"]


class AnalyticsSummarySerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_subjects = serializers.IntegerField()
    total_results = serializers.IntegerField()
    pass_count = serializers.IntegerField()
    fail_count = serializers.IntegerField()
    pass_rate = serializers.FloatField()
    average_marks = serializers.FloatField()
    average_cgpa = serializers.FloatField()
