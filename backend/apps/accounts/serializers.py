"""
FILE:     backend/apps/accounts/serializers.py
PURPOSE:  Serializers for registration, JWT login response, and user profile
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model  = User
        fields = ["email", "full_name", "phone", "password", "password2", "role"]
        extra_kwargs = {
            "role":  {"default": User.Role.CLIENT},
            "phone": {"required": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        # Prevent self-promotion to admin via API
        if attrs.get("role") == User.Role.ADMIN:
            raise serializers.ValidationError(
                {"role": "Cannot self-register as admin."}
            )
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "id", "email", "full_name", "phone", "avatar",
            "role", "email_verified", "created_at",
        ]
        read_only_fields = ["id", "email_verified", "created_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    """For PATCH /auth/me/ — only safe fields."""
    class Meta:
        model  = User
        fields = ["full_name", "phone", "avatar"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Enriches the token response with user data so the frontend
    doesn't need a second round-trip to /me/ after login."""
    def validate(self, attrs):
        data        = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data