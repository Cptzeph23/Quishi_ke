"""
FILE:     backend/apps/properties/admin.py
PURPOSE:  Admin registration for Property, Amenity, PropertyImage, SavedProperty
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Amenity, Property, PropertyImage, SavedProperty


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display  = ["name", "icon"]
    search_fields = ["name"]
    ordering      = ["name"]


class PropertyImageInline(admin.TabularInline):
    model      = PropertyImage
    extra      = 0
    fields     = ["image", "thumbnail_preview", "is_primary", "order", "alt_text"]
    readonly_fields = ["thumbnail_preview"]

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" style="height:48px;border-radius:4px;" />',
                obj.thumbnail.url
            )
        return "—"
    thumbnail_preview.short_description = "Preview"


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    # ── List view ─────────────────────────────────────────────────────────────
    list_display   = ["title", "city", "property_type", "status",
                      "price", "bedrooms", "is_featured", "views_count", "created_at"]
    list_filter    = ["status", "property_type", "city", "is_featured", "created_at"]
    search_fields  = ["title", "description", "city", "neighborhood", "address"]
    ordering       = ["-created_at"]
    list_editable  = ["is_featured", "status"]
    list_per_page  = 25

    # ── Detail view ───────────────────────────────────────────────────────────
    fieldsets = (
        ("Listing Info",  {"fields": ("title", "description", "property_type",
                                      "status", "is_featured", "listed_by")}),
        ("Location",      {"fields": ("address", "city", "neighborhood",
                                      "floor_number", "house_number",
                                      "latitude", "longitude")}),
        ("Specifications",{"fields": ("bedrooms", "bathrooms", "area_sqm")}),
        ("Pricing",       {"fields": ("price", "price_per_sqm", "is_negotiable")}),
        ("Amenities",     {"fields": ("amenities",)}),
        ("Metrics",       {"fields": ("views_count", "created_at", "updated_at"),
                           "classes": ("collapse",)}),
    )
    readonly_fields  = ["price_per_sqm", "views_count", "created_at", "updated_at"]
    filter_horizontal = ["amenities"]
    inlines          = [PropertyImageInline]
    raw_id_fields    = ["listed_by"]


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display  = ["user", "property", "saved_at"]
    list_filter   = ["saved_at"]
    search_fields = ["user__email", "property__title"]
    ordering      = ["-saved_at"]