"""
FILE:     backend/apps/analytics/urls.py
PURPOSE:  URL patterns for analytics namespace (admin-only)
"""
from django.urls import path
from .views import DashboardStatsView, PropertyStatsView, AuditLogListView

app_name = "analytics"

urlpatterns = [
    path("dashboard/",   DashboardStatsView.as_view(), name="dashboard"),
    path("properties/",  PropertyStatsView.as_view(),  name="property-stats"),
    path("audit-logs/",  AuditLogListView.as_view(),   name="audit-logs"),
]