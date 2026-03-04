"""
FILE:     backend/apps/properties/models.py
PURPOSE:  Core property data models
MODELS:   Amenity, Property, PropertyImage (with auto-thumbnail), SavedProperty
"""
import uuid
import os
from django.db import models
from django.conf import settings
from PIL import Image as PILImage


# ── Amenity ───────────────────────────────────────────────────────────────────

class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, blank=True,
                            help_text="Lucide icon name e.g. 'wifi', 'car'")

    class Meta:
        db_table            = "amenities"
        verbose_name_plural = "amenities"
        ordering            = ["name"]

    def __str__(self): return self.name


# ── Property ──────────────────────────────────────────────────────────────────

class Property(models.Model):

    class Status(models.TextChoices):
        AVAILABLE   = "available",   "Available"
        RENTED      = "rented",      "Rented"
        SOLD        = "sold",        "Sold"
        MAINTENANCE = "maintenance", "Under Maintenance"

    class PropType(models.TextChoices):
        APARTMENT = "apartment", "Apartment"
        HOUSE     = "house",     "House"
        STUDIO    = "studio",    "Studio"
        PENTHOUSE = "penthouse", "Penthouse"
        OFFICE    = "office",    "Office"

    # ── Identity ──────────────────────────────────────────────────────────────
    id    = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description   = models.TextField()
    property_type = models.CharField(
        max_length=15, choices=PropType.choices, default=PropType.APARTMENT
    )

    # ── Location ──────────────────────────────────────────────────────────────
    address      = models.CharField(max_length=300)
    city         = models.CharField(max_length=100)
    neighborhood = models.CharField(max_length=100, blank=True)
    floor_number = models.PositiveSmallIntegerField(default=0)
    house_number = models.CharField(max_length=20)
    latitude     = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude    = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # ── Specs ─────────────────────────────────────────────────────────────────
    bedrooms  = models.PositiveSmallIntegerField(default=1)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    area_sqm  = models.DecimalField(max_digits=8, decimal_places=2)

    # ── Pricing ───────────────────────────────────────────────────────────────
    price         = models.DecimalField(max_digits=12, decimal_places=2)
    price_per_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_negotiable = models.BooleanField(default=False)

    # ── Status & Relations ────────────────────────────────────────────────────
    status    = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE)
    amenities = models.ManyToManyField(Amenity, blank=True, related_name="properties")
    listed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="listings",
    )

    # ── Meta ──────────────────────────────────────────────────────────────────
    views_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "properties"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["city", "status"]),
            models.Index(fields=["property_type", "status"]),
            models.Index(fields=["price", "bedrooms"]),
            models.Index(fields=["is_featured", "-created_at"]),
            models.Index(fields=["status"]),
        ]

    def save(self, *args, **kwargs):
        # Auto-compute price per sqm
        if self.area_sqm and self.price:
            self.price_per_sqm = round(float(self.price) / float(self.area_sqm), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} — {self.city} ({self.status})"


# ── Image upload paths ────────────────────────────────────────────────────────

def image_upload_path(instance, filename):
    ext  = filename.rsplit(".", 1)[-1].lower()
    name = uuid.uuid4().hex
    return f"properties/{instance.property.id}/{name}.{ext}"

def thumbnail_upload_path(instance, filename):
    ext  = filename.rsplit(".", 1)[-1].lower()
    name = uuid.uuid4().hex
    return f"properties/{instance.property.id}/thumbs/{name}.{ext}"


# ── PropertyImage ─────────────────────────────────────────────────────────────

class PropertyImage(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property   = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image      = models.ImageField(upload_to=image_upload_path)
    thumbnail  = models.ImageField(
        upload_to=thumbnail_upload_path, null=True, blank=True, editable=False
    )
    alt_text   = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order      = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "property_images"
        ordering = ["order", "created_at"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._generate_thumbnail()

    def _generate_thumbnail(self):
        """Compress + resize to 400×300 JPEG (quality 75) — non-fatal on error."""
        if not self.image:
            return
        try:
            img = PILImage.open(self.image.path)
            img.thumbnail((400, 300), PILImage.LANCZOS)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            thumb_dir  = os.path.join(
                settings.MEDIA_ROOT, f"properties/{self.property.id}/thumbs"
            )
            os.makedirs(thumb_dir, exist_ok=True)
            thumb_name = f"thumb_{uuid.uuid4().hex}.jpg"
            thumb_path = os.path.join(thumb_dir, thumb_name)
            img.save(thumb_path, "JPEG", quality=75, optimize=True)
            rel = f"properties/{self.property.id}/thumbs/{thumb_name}"
            PropertyImage.objects.filter(pk=self.pk).update(thumbnail=rel)
        except Exception:
            pass  # thumbnail failure is non-fatal


# ── SavedProperty ─────────────────────────────────────────────────────────────

class SavedProperty(models.Model):
    user     = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved"
    )
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="saves")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table       = "saved_properties"
        unique_together = ("user", "property")