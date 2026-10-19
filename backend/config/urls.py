"""
==============================================================================
JANMITRA - Civic Issue Reporting & Management System
File: config/urls.py
Author: Team ResolveIT
Description: Root URL Configuration with Notifications, Dashboard, and Admin.
==============================================================================
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Notifications API: /api/v1/notifications/
    path('api/v1/notifications/', include('notifications.urls')),

    # Auth APIs (register, login, me, fcm-token, profile): /api/v1/auth/
    path('api/v1/auth/', include('notifications.urls')),

    # Complaints APIs: /api/v1/complaints/
    path('api/v1/complaints/', include('complaints.urls')),

    # Dashboard APIs: /api/v1/dashboard/
    path('api/v1/dashboard/', include('dashboard.urls')),

    # Admin APIs: /api/v1/admin/
    path('api/v1/admin/', include('dashboard.admin_urls')),

    # Announcements API: /api/v1/announcements/
    path('api/v1/announcements/', include('dashboard.admin_urls')),
]
