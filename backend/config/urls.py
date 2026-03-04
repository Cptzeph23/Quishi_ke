"""
FILE:     backend/config/urls.py
PURPOSE:  Root URL router — mounts all app namespaces under /api/v1/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

V1 = "api/v1/"

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # API v1 namespaces
    path(V1 + "auth/",       include("apps.accounts.urls",   namespace="accounts")),
    path(V1 + "properties/", include("apps.properties.urls", namespace="properties")),
    path(V1 + "chatbot/",    include("apps.chatbot.urls",    namespace="chatbot")),
    path(V1 + "analytics/",  include("apps.analytics.urls",  namespace="analytics")),

    # Interactive API docs
    path("api/schema/", SpectacularAPIView.as_view(),                          name="schema"),
    path("api/docs/",   SpectacularSwaggerView.as_view(url_name="schema"),     name="swagger-ui"),
    path("api/redoc/",  SpectacularRedocView.as_view(url_name="schema"),       name="redoc"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)