"""
FILE:     backend/apps/properties/filters.py
PURPOSE:  Property FilterSet — translates query params to queryset filters
SUPPORTS: ?min_price=&max_price=&city=&bedrooms=&property_type=&status=&amenities=1,2
"""
import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    # Price range
    min_price = django_filters.NumberFilter(field_name="price",    lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price",    lookup_expr="lte")

    # Area range
    min_area  = django_filters.NumberFilter(field_name="area_sqm", lookup_expr="gte")
    max_area  = django_filters.NumberFilter(field_name="area_sqm", lookup_expr="lte")

    # Bedrooms minimum
    min_beds  = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")

    # Amenities: comma-separated IDs e.g. ?amenities=1,3,5
    amenities = django_filters.CharFilter(method="filter_amenities",
                                          help_text="Comma-separated amenity IDs")

    class Meta:
        model  = Property
        fields = [
            "city", "neighborhood", "status", "property_type",
            "bedrooms", "bathrooms", "is_featured", "is_negotiable",
        ]

    def filter_amenities(self, queryset, name, value):
        ids = [v.strip() for v in value.split(",") if v.strip().isdigit()]
        for aid in ids:
            queryset = queryset.filter(amenities__id=aid)
        return queryset