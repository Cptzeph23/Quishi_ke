"""
FILE:     backend/apps/enquiries/serializers.py
PURPOSE:  Serializers for creating and reading enquiries.
"""
from rest_framework import serializers
from .models import Enquiry


class EnquiryCreateSerializer(serializers.ModelSerializer):
    """Used for POST — accepts sender details + message."""

    class Meta:
        model  = Enquiry
        fields = [
            "property",
            "sender_name",
            "sender_email",
            "sender_phone",
            "message",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        # Auto-fill sender fields if authenticated
        if request and request.user.is_authenticated:
            validated_data.setdefault("sender",       request.user)
            validated_data.setdefault("sender_name",  request.user.full_name)
            validated_data.setdefault("sender_email", request.user.email)
        return super().create(validated_data)


class EnquirySerializer(serializers.ModelSerializer):
    """Full read serializer — returned to agents/admin."""
    property_title = serializers.CharField(
        source="property.title", read_only=True
    )

    class Meta:
        model  = Enquiry
        fields = [
            "id",
            "property",
            "property_title",
            "sender_name",
            "sender_email",
            "sender_phone",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "property_title"]