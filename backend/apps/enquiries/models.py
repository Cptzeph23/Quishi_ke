"""
FILE:     backend/apps/enquiries/models.py
PURPOSE:  Enquiry — a prospective tenant/buyer contacting the listing agent.
"""
import uuid
from django.db import models
from django.conf import settings


class Enquiry(models.Model):

    class Status(models.TextChoices):
        NEW      = "new",      "New"
        READ     = "read",     "Read"
        REPLIED  = "replied",  "Replied"
        ARCHIVED = "archived", "Archived"

    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="enquiries",
    )
    # Sender — optional (anonymous enquiries allowed)
    sender   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="enquiries_sent",
    )
    # Fallback fields for anonymous senders
    sender_name  = models.CharField(max_length=150)
    sender_email = models.EmailField()
    sender_phone = models.CharField(max_length=30, blank=True)

    message    = models.TextField()
    status     = models.CharField(
        max_length=15, choices=Status.choices, default=Status.NEW
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "enquiries"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["property", "status"]),
            models.Index(fields=["sender_email"]),
        ]

    def __str__(self):
        return f"Enquiry from {self.sender_email} on {self.property}"