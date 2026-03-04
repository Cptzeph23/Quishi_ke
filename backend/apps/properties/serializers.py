"""
FILE:     backend/apps/properties/serializers.py
PURPOSE:  Property serializers
          PropertyListSerializer  — lightweight for /properties/ list
          PropertyDetailSerializer — full data for /properties/<id>/
"""
from rest_framework import serializers
from .models import Amenity, Property, PropertyImage


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Amenity
        fields = ["id", "name", "icon"]


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PropertyImage
        fields = ["id", "image", "thumbnail", "alt_text", "is_primary", "order"]


class PropertyListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the property list endpoint.
    Only sends the primary thumbnail, not the full image array.
    """
    primary_image = serializers.SerializerMethodField()
    amenity_count = serializers.IntegerField(source="amenities.count", read_only=True)

    class Meta:
        model  = Property
        fields = [
            "id", "title", "property_type", "city", "neighborhood",
            "floor_number", "house_number", "bedrooms", "bathrooms",
            "area_sqm", "price", "price_per_sqm",
            "status", "is_featured", "is_negotiable",
            "amenity_count", "primary_image",
            "views_count", "created_at",
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not img:
            return None
        request = self.context.get("request")
        url = img.thumbnail.url if img.thumbnail else img.image.url
        return request.build_absolute_uri(url) if request else url


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Full property detail including all images and amenities."""
    images      = PropertyImageSerializer(many=True, read_only=True)
    amenities   = AmenitySerializer(many=True, read_only=True)
    amenity_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Amenity.objects.all(),
        write_only=True, source="amenities", required=False,
    )
    listed_by   = serializers.SerializerMethodField()

    class Meta:
        model  = Property
        fields = [
            "id", "title", "description", "property_type",
            "address", "city", "neighborhood",
            "floor_number", "house_number",
            "latitude", "longitude",
            "bedrooms", "bathrooms", "area_sqm",
            "price", "price_per_sqm", "is_negotiable",
            "status", "amenities", "amenity_ids",
            "images", "listed_by",
            "views_count", "is_featured",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "price_per_sqm", "views_count", "created_at", "updated_at",
        ]

    def get_listed_by(self, obj):
        if obj.listed_by:
            return {
                "id":    str(obj.listed_by.id),
                "name":  obj.listed_by.full_name,
                "email": obj.listed_by.email,
            }
        return None