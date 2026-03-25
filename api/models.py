"""
Database models for the Student Performance Management System.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Student(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    name = models.CharField(max_length=255)
    roll_number = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    department = models.CharField(max_length=255)
    year = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(6)]
    )
    enrollment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["roll_number"]),
            models.Index(fields=["department"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.roll_number})"

    @property
    def cgpa(self):
        """Calculate CGPA from all results."""
        results = self.results.select_related("subject").all()
        if not results:
            return 0.0
        total_weighted = sum(r.grade_point * r.subject.credit for r in results)
        total_credits = sum(r.subject.credit for r in results)
        return round(total_weighted / total_credits, 2) if total_credits > 0 else 0.0


class Subject(models.Model):
    name = models.CharField(max_length=255, unique=True)
    subject_code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    credit = models.PositiveIntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.subject_code})"


class Result(models.Model):
    GRADE_CHOICES = [
        ("O", "Outstanding (90-100)"),
        ("A+", "Excellent (80-89)"),
        ("A", "Very Good (70-79)"),
        ("B+", "Good (60-69)"),
        ("B", "Above Average (50-59)"),
        ("C", "Average (40-49)"),
        ("F", "Fail (0-39)"),
    ]

    STATUS_CHOICES = [
        ("pass", "Pass"),
        ("fail", "Fail"),
    ]

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="results"
    )
    marks = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    total_marks = models.FloatField(default=100)
    percentage = models.FloatField(editable=False, default=0)
    grade = models.CharField(max_length=3, choices=GRADE_CHOICES, editable=False)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, editable=False
    )
    exam_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-exam_date"]
        unique_together = ("student", "subject", "exam_date")
        indexes = [
            models.Index(fields=["student", "subject"]),
            models.Index(fields=["status"]),
            models.Index(fields=["exam_date"]),
        ]

    def __str__(self):
        return f"{self.student.name} - {self.subject.name}: {self.marks}"

    @property
    def grade_point(self):
        """Return grade point on a 10-point scale."""
        m = self.marks
        if m >= 90:
            return 10
        if m >= 80:
            return 9
        if m >= 70:
            return 8
        if m >= 60:
            return 7
        if m >= 50:
            return 6
        if m >= 40:
            return 5
        return 0

    def _calculate_grade(self):
        m = self.marks
        if m >= 90:
            return "O"
        if m >= 80:
            return "A+"
        if m >= 70:
            return "A"
        if m >= 60:
            return "B+"
        if m >= 50:
            return "B"
        if m >= 40:
            return "C"
        return "F"

    def save(self, *args, **kwargs):
        self.percentage = round((self.marks / self.total_marks) * 100, 2)
        self.grade = self._calculate_grade()
        self.status = "pass" if self.marks >= 40 else "fail"
        super().save(*args, **kwargs)
