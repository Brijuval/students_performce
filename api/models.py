from django.db import models

from utils.helpers import calculate_grade, calculate_percentage, get_pass_status


class ActiveStudentManager(models.Manager):
    """Custom manager that returns only students with status='active'."""

    def get_queryset(self):
        """Return queryset filtered to active students only."""
        return super().get_queryset().filter(status='active')


class Student(models.Model):
    """Represents a student enrolled in the institution.

    Fields:
        name: Full name of the student.
        email: Unique email address used as a contact identifier.
        phone: 10-digit contact phone number.
        enrollment_date: The date the student was enrolled.
        status: Enrolment status – 'active' (default) or 'inactive'.
        created_at: Timestamp when the record was created (auto-set).
        updated_at: Timestamp when the record was last modified (auto-set).

    Managers:
        objects: Default manager; returns all students.
        active: Custom manager; returns only active students.
    """

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    enrollment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    active = ActiveStudentManager()

    def __str__(self):
        return f"{self.name} ({self.email})"

    class Meta:
        ordering = ['name']


class Subject(models.Model):
    """Represents an academic subject offered by the institution.

    Fields:
        name: Unique full name of the subject (e.g., 'Mathematics').
        code: Unique short code for the subject (e.g., 'MATH101').
        description: Optional extended description of the subject.
        created_at: Timestamp when the record was created (auto-set).
    """

    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        ordering = ['name']


class PassResultManager(models.Manager):
    """Custom manager that returns only results with status='pass'."""

    def get_queryset(self):
        """Return queryset filtered to passing results only."""
        return super().get_queryset().filter(status='pass')


class Result(models.Model):
    """Represents the outcome of a student's exam for a particular subject.

    The ``percentage``, ``grade``, and ``status`` fields are automatically
    computed by the ``save()`` method and are not editable via the API.

    Fields:
        student: Foreign key to the Student who sat the exam.
        subject: Foreign key to the Subject being examined.
        marks_obtained: Raw marks scored by the student.
        total_marks: Maximum possible marks (default: 100).
        percentage: Auto-calculated as (marks_obtained / total_marks) × 100.
        grade: Auto-calculated letter grade (A, B, C, D, or F).
        status: Auto-calculated pass/fail based on a 40 % threshold.
        exam_date: Date on which the exam was held.
        created_at: Timestamp when the record was created (auto-set).
        updated_at: Timestamp when the record was last modified (auto-set).

    Constraints:
        unique_together: A student can have only one result per subject per exam date.

    Managers:
        objects: Default manager; returns all results.
        passing: Custom manager; returns only passing results.
    """

    GRADE_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
        ('F', 'F'),
    ]
    STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='results')
    marks_obtained = models.FloatField()
    total_marks = models.FloatField(default=100)
    percentage = models.FloatField(editable=False, default=0)
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES, editable=False, default='F')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, editable=False, default='fail')
    exam_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    passing = PassResultManager()

    class Meta:
        unique_together = ('student', 'subject', 'exam_date')
        ordering = ['-exam_date']

    def save(self, *args, **kwargs):
        """Auto-calculate percentage, grade, and pass/fail status before saving."""
        self.percentage = calculate_percentage(self.marks_obtained, self.total_marks)
        self.grade = calculate_grade(self.percentage)
        self.status = get_pass_status(self.percentage)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.grade}"
