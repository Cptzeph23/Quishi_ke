"""
FILE:     backend/apps/accounts/urls.py
PURPOSE:  URL patterns for auth namespace
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    MeView,
    UserListView,
    UserDetailView,
)

app_name = "accounts"

urlpatterns = [
    # Auth
    path("register/",        RegisterView.as_view(),              name="register"),
    path("login/",           CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/",   TokenRefreshView.as_view(),          name="token-refresh"),
    path("token/logout/",    TokenBlacklistView.as_view(),        name="token-blacklist"),

    # Profile
    path("me/",              MeView.as_view(),                    name="me"),

    # Admin user management
    path("users/",           UserListView.as_view(),              name="user-list"),
    path("users/<uuid:pk>/", UserDetailView.as_view(),            name="user-detail"),
]