"""
FILE:     backend/apps/analytics/views.py
PURPOSE:  Admin-only analytics endpoints — dashboard stats, property breakdowns, audit log
"""
from datetime import timedelta
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.permissions import IsAdmin
from apps.properties.models import Property
from apps.audit.models import AuditLog


class DashboardStatsView(APIView):
    """
    GET /api/v1/analytics/dashboard/
    Returns key platform metrics for the admin overview card row.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        now       = timezone.now()
        month_ago = now - timedelta(days=30)
        week_ago  = now - timedelta(days=7)

        return Response({
            # Property metrics
            "total_properties":     Property.objects.count(),
            "available_properties": Property.objects.filter(status="available").count(),
            "rented_properties":    Property.objects.filter(status="rented").count(),
            "featured_properties":  Property.objects.filter(is_featured=True).count(),
            "avg_price":            Property.objects.aggregate(avg=Avg("price"))["avg"] or 0,
            "total_views":          Property.objects.aggregate(v=Sum("views_count"))["v"] or 0,

            # User metrics
            "total_users":          User.objects.count(),
            "total_agents":         User.objects.filter(role="agent").count(),
            "total_clients":        User.objects.filter(role="client").count(),
            "new_users_this_month": User.objects.filter(created_at__gte=month_ago).count(),
            "new_users_this_week":  User.objects.filter(created_at__gte=week_ago).count(),

            # Activity
            "api_calls_today":      AuditLog.objects.filter(
                                        created_at__date=now.date()
                                    ).count(),
            "api_calls_this_week":  AuditLog.objects.filter(
                                        created_at__gte=week_ago
                                    ).count(),
        })


class PropertyStatsView(APIView):
    """
    GET /api/v1/analytics/properties/
    Breakdowns by type, city, and status — used for dashboard charts.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "by_type": list(
                Property.objects
                .values("property_type")
                .annotate(count=Count("id"), avg_price=Avg("price"))
                .order_by("-count")
            ),
            "by_city": list(
                Property.objects
                .values("city")
                .annotate(count=Count("id"))
                .order_by("-count")[:10]
            ),
            "by_status": list(
                Property.objects
                .values("status")
                .annotate(count=Count("id"))
            ),
        })


class AuditLogListView(APIView):
    """
    GET /api/v1/analytics/audit-logs/
    Paginated audit log viewer with optional filters:
      ?method=POST  ?path=/api/v1/properties/  ?page=2
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = AuditLog.objects.select_related("user").order_by("-created_at")

        if method := request.query_params.get("method"):
            qs = qs.filter(method=method.upper())
        if path_q := request.query_params.get("path"):
            qs = qs.filter(path__icontains=path_q)
        if status_code := request.query_params.get("status_code"):
            qs = qs.filter(status_code=status_code)

        paginator          = PageNumberPagination()
        paginator.page_size = 50
        page = paginator.paginate_queryset(qs, request)

        data = [
            {
                "id":          str(log.id),
                "method":      log.method,
                "path":        log.path,
                "status_code": log.status_code,
                "user":        log.user.email if log.user else None,
                "ip_address":  log.ip_address,
                "duration_ms": log.duration_ms,
                "created_at":  log.created_at,
            }
            for log in page
        ]
        return paginator.get_paginated_response(data)