"""URL routing for the Students Performance API."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AnalyticsViewSet, ResultViewSet, StudentViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
