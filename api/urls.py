from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StudentViewSet, SubjectViewSet, ResultViewSet, AnalyticsViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
