"""
FILE:     backend/config/urls.py
PURPOSE:  Root URL router — mounts all app namespaces under /api/v1/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

V1 = "api/v1/"


@api_view(["GET"])
@permission_classes([AllowAny])
def api_root(request):
    """
    GET /api/v1/
    Returns a directory of all available API endpoints.
    """
    base = request.build_absolute_uri("/api/v1/")
    return Response({
        "name":    "SmartRealty API",
        "version": "1.0.0",
        "docs":    request.build_absolute_uri("/api/docs/"),
        "redoc":   request.build_absolute_uri("/api/redoc/"),
        "endpoints": {
            "auth": {
                "register":      base + "auth/register/",
                "login":         base + "auth/login/",
                "token_refresh": base + "auth/token/refresh/",
                "logout":        base + "auth/token/logout/",
                "me":            base + "auth/me/",
                "users":         base + "auth/users/",
            },
            "properties": {
                "list":      base + "properties/",
                "featured":  base + "properties/featured/",
                "saved":     base + "properties/saved/",
                "amenities": base + "properties/amenities/",
            },
            "chatbot":   base + "chatbot/",
            "enquiries": base + "enquiries/",
            "analytics": {
                "dashboard":    base + "analytics/dashboard/",
                "properties":   base + "analytics/properties/",
                "audit_logs":   base + "analytics/audit-logs/",
            },
        },
    })


urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # API v1 root — browseable endpoint directory
    path(V1, api_root, name="api-root"),

    # API v1 namespaces
    path(V1 + "auth/",       include("apps.accounts.urls",   namespace="accounts")),
    path(V1 + "properties/", include("apps.properties.urls", namespace="properties")),
    path(V1 + "chatbot/",    include("apps.chatbot.urls",    namespace="chatbot")),
    path(V1 + "analytics/",  include("apps.analytics.urls",  namespace="analytics")),
    path(V1 + "enquiries/",  include("apps.enquiries.urls")),

    # Interactive API docs
    path("api/schema/", SpectacularAPIView.as_view(),                          name="schema"),
    path("api/docs/",   SpectacularSwaggerView.as_view(url_name="schema"),     name="swagger-ui"),
    path("api/redoc/",  SpectacularRedocView.as_view(url_name="schema"),       name="redoc"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)