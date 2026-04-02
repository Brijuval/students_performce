"""
URL configuration for the Students Performance Management System.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'message': 'Students Performance Management API',
        'version': '1.0',
        'endpoints': {
            'students': '/api/students/',
            'subjects': '/api/subjects/',
            'results': '/api/results/',
            'analytics': '/api/analytics/',
            'admin': '/admin/',
        }
    })


urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
