"""
FILE:     backend/apps/properties/views.py
PURPOSE:  Property CRUD, image upload, save/unsave, amenity list
"""
from django.db import models as db_models
from rest_framework import generics, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView

from apps.accounts.permissions import IsAgentOrAdmin, IsOwnerOrAdmin

from .models import Amenity, Property, PropertyImage, SavedProperty
from .serializers import (
    AmenitySerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyImageSerializer,
)
from .filters import PropertyFilter


class PropertyViewSet(ModelViewSet):
    """
    list:   GET  /api/v1/properties/            — public, filterable, paginated
    create: POST /api/v1/properties/            — agent or admin
    retrieve: GET /api/v1/properties/<id>/      — public, increments view count
    update: PATCH /api/v1/properties/<id>/      — owner or admin
    destroy: DELETE /api/v1/properties/<id>/    — owner or admin
    featured: GET /api/v1/properties/featured/  — top 8 featured available
    saved: GET /api/v1/properties/saved/        — authenticated user's saves
    """
    queryset = (
        Property.objects
        .select_related("listed_by")
        .prefetch_related("images", "amenities")
    )
    filterset_class = PropertyFilter
    search_fields   = ["title", "description", "city", "neighborhood", "address"]
    ordering_fields = ["price", "created_at", "bedrooms", "area_sqm", "views_count"]
    ordering        = ["-created_at"]

    def get_serializer_class(self):
        return PropertyListSerializer if self.action == "list" else PropertyDetailSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve", "featured"):
            return [permissions.AllowAny()]
        if self.action == "create":
            return [IsAgentOrAdmin()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic view count increment (no race condition)
        Property.objects.filter(pk=instance.pk).update(
            views_count=db_models.F("views_count") + 1
        )
        instance.refresh_from_db(fields=["views_count"])
        return Response(self.get_serializer(instance).data)

    def perform_create(self, serializer):
        serializer.save(listed_by=self.request.user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """Return top 8 featured available properties."""
        qs = (
            self.get_queryset()
            .filter(is_featured=True, status="available")
            .order_by("-created_at")[:8]
        )
        return Response(
            PropertyListSerializer(qs, many=True, context={"request": request}).data
        )

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def saved(self, request):
        """Return the authenticated user's saved properties."""
        ids = SavedProperty.objects.filter(user=request.user).values_list(
            "property_id", flat=True
        )
        qs  = self.get_queryset().filter(id__in=ids)
        return Response(
            PropertyListSerializer(qs, many=True, context={"request": request}).data
        )


class PropertyImageUploadView(APIView):
    """
    POST /api/v1/properties/<uuid>/images/
    Multipart: field name = 'images' (multiple files supported)
    """
    parser_classes     = [parsers.MultiPartParser, parsers.FormParser]
    permission_classes = [IsAgentOrAdmin]

    def post(self, request, property_id):
        try:
            prop = Property.objects.get(pk=property_id, listed_by=request.user)
        except Property.DoesNotExist:
            return Response({"detail": "Property not found or not yours."}, status=404)

        files = request.FILES.getlist("images")
        if not files:
            return Response({"detail": "No images provided."}, status=400)

        created = []
        existing_count = prop.images.count()
        for i, f in enumerate(files):
            obj = PropertyImage.objects.create(
                property   = prop,
                image      = f,
                order      = existing_count + i,
                is_primary = (i == 0 and existing_count == 0),
            )
            created.append(
                PropertyImageSerializer(obj, context={"request": request}).data
            )
        return Response(created, status=201)


class AmenityListView(generics.ListAPIView):
    """GET /api/v1/properties/amenities/ — public list of all amenities."""
    serializer_class   = AmenitySerializer
    queryset           = Amenity.objects.all()
    permission_classes = [permissions.AllowAny]


class SavePropertyView(APIView):
    """
    POST   /api/v1/properties/<uuid>/save/ — save property
    DELETE /api/v1/properties/<uuid>/save/ — unsave property
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, property_id):
        prop = generics.get_object_or_404(Property, pk=property_id)
        _, created = SavedProperty.objects.get_or_create(
            user=request.user, property=prop
        )
        return Response({"saved": True, "created": created})

    def delete(self, request, property_id):
        SavedProperty.objects.filter(
            user=request.user, property_id=property_id
        ).delete()
        return Response({"saved": False})