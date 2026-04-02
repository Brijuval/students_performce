"""Database models for the Students Performance application."""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Student(models.Model):
    """Represents a student enrolled in the institution."""

    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    roll_number = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=255)
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    enrollment_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['roll_number']),
            models.Index(fields=['department']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.roll_number})"


class Subject(models.Model):
    """Represents an academic subject."""

    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, default='')
    credit = models.PositiveSmallIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Result(models.Model):
    """Stores an individual exam result linking a student to a subject."""

    GRADE_A = 'A'
    GRADE_B = 'B'
    GRADE_C = 'C'
    GRADE_D = 'D'
    GRADE_F = 'F'
    GRADE_CHOICES = [
        (GRADE_A, 'A'),
        (GRADE_B, 'B'),
        (GRADE_C, 'C'),
        (GRADE_D, 'D'),
        (GRADE_F, 'F'),
    ]

    STATUS_PASS = 'pass'
    STATUS_FAIL = 'fail'
    STATUS_CHOICES = [
        (STATUS_PASS, 'Pass'),
        (STATUS_FAIL, 'Fail'),
    ]

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='results',
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='results',
    )
    marks_obtained = models.FloatField(
        validators=[MinValueValidator(0.0)]
    )
    total_marks = models.FloatField(default=100.0)
    percentage = models.FloatField(editable=False, default=0.0)
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES, editable=False)
    status = models.CharField(max_length=4, choices=STATUS_CHOICES, editable=False)
    exam_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('student', 'subject', 'exam_date')]
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['subject']),
            models.Index(fields=['exam_date']),
        ]

    # ------------------------------------------------------------------
    # Grade / percentage helpers
    # ------------------------------------------------------------------
    @staticmethod
    def calculate_percentage(marks_obtained: float, total_marks: float) -> float:
        if total_marks <= 0:
            return 0.0
        return round((marks_obtained / total_marks) * 100, 2)

    @staticmethod
    def calculate_grade(percentage: float) -> str:
        if percentage >= 90:
            return Result.GRADE_A
        if percentage >= 80:
            return Result.GRADE_B
        if percentage >= 70:
            return Result.GRADE_C
        if percentage >= 60:
            return Result.GRADE_D
        return Result.GRADE_F

    @staticmethod
    def calculate_status(percentage: float) -> str:
        return Result.STATUS_PASS if percentage >= 40 else Result.STATUS_FAIL

    def save(self, *args, **kwargs):
        self.percentage = self.calculate_percentage(self.marks_obtained, self.total_marks)
        self.grade = self.calculate_grade(self.percentage)
        self.status = self.calculate_status(self.percentage)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} – {self.subject} ({self.percentage}%)"
