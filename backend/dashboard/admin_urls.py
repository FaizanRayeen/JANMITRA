"""
==============================================================================
JANMITRA - Civic Issue Reporting & Management System
File: janmitra-backend/dashboard/admin_urls.py
Author: Team ResolveIT
Description: Admin Worker Management URLs: /api/v1/admin/workers/
==============================================================================
"""

from django.urls import path
from .admin_workers_view import (
    AdminWorkersListCreateView,
    AdminWorkerDetailUpdateView,
    AdminSettingsView
)

urlpatterns = [
    path('workers/', AdminWorkersListCreateView.as_view(), name='admin-workers-list-create'),
    path('workers', AdminWorkersListCreateView.as_view(), name='admin-workers-list-create-notrail'),
    path('workers/<str:worker_id>/', AdminWorkerDetailUpdateView.as_view(), name='admin-worker-detail-update'),
    path('workers/<str:worker_id>', AdminWorkerDetailUpdateView.as_view(), name='admin-worker-detail-update-notrail'),
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('settings', AdminSettingsView.as_view(), name='admin-settings-notrail'),
    path('announcements/', AdminSettingsView.as_view(), name='admin-announcements'),
    path('announcements', AdminSettingsView.as_view(), name='admin-announcements-notrail'),
]

