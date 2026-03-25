from django.db import models

from utils.helpers import calculate_grade, calculate_percentage, get_pass_status


class ActiveStudentManager(models.Manager):
    """Manager to return only active students"""

    def get_queryset(self):
        return super().get_queryset().filter(status='active')


class Student(models.Model):
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
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        ordering = ['name']


class PassResultManager(models.Manager):
    """Manager to return only passing results"""

    def get_queryset(self):
        return super().get_queryset().filter(status='pass')


class Result(models.Model):
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
        self.percentage = calculate_percentage(self.marks_obtained, self.total_marks)
        self.grade = calculate_grade(self.percentage)
        self.status = get_pass_status(self.percentage)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.grade}"
