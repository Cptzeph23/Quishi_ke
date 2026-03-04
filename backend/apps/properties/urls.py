"""
FILE:     backend/apps/properties/urls.py
PURPOSE:  URL patterns for the properties namespace
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet,
    PropertyImageUploadView,
    AmenityListView,
    SavePropertyView,
)

app_name = "properties"

router = DefaultRouter()
router.register("", PropertyViewSet, basename="property")

urlpatterns = [
    # Static routes MUST come before router.urls to avoid UUID capture
    path("amenities/",                   AmenityListView.as_view(),         name="amenities"),
    path("<uuid:property_id>/images/",   PropertyImageUploadView.as_view(), name="images"),
    path("<uuid:property_id>/save/",     SavePropertyView.as_view(),        name="save"),

    # Router handles: list, create, retrieve, update, destroy, featured, saved
    path("", include(router.urls)),
]