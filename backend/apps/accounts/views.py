"""
FILE:     backend/apps/accounts/views.py
PURPOSE:  Auth endpoints — register, login/logout, profile, admin user management
"""
from rest_framework import generics, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import IsAdmin


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Public — creates a new user account (client or agent roles only).
    """
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    Returns access + refresh tokens plus full user object.
    """
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    """
    GET  /api/v1/auth/me/  — return authenticated user profile
    PATCH /api/v1/auth/me/ — update name / phone / avatar
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [parsers.MultiPartParser, parsers.JSONParser]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        s = UserUpdateSerializer(request.user, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(UserSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    """
    GET /api/v1/auth/users/
    Admin-only: paginated list of all users with filtering.
    """
    serializer_class   = UserSerializer
    permission_classes = [IsAdmin]
    queryset           = User.objects.all().order_by("-created_at")
    filterset_fields   = ["role", "is_active"]
    search_fields      = ["email", "full_name"]
    ordering_fields    = ["created_at", "full_name"]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/v1/auth/users/<uuid>/
    Admin-only: manage individual users.
    """
    serializer_class   = UserSerializer
    permission_classes = [IsAdmin]
    queryset           = User.objects.all()