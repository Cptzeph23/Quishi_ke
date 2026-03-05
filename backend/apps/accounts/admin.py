"""
FILE:     backend/apps/accounts/admin.py
PURPOSE:  Register User model in Django admin with custom display and filters
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # ── List view ─────────────────────────────────────────────────────────────
    list_display   = ["email", "full_name", "role", "is_active",
                      "email_verified", "created_at"]
    list_filter    = ["role", "is_active", "email_verified", "created_at"]
    search_fields  = ["email", "full_name", "phone"]
    ordering       = ["-created_at"]

    # ── Detail view ───────────────────────────────────────────────────────────
    fieldsets = (
        ("Identity",     {"fields": ("email", "full_name", "phone", "avatar")}),
        ("Role & Access",{"fields": ("role", "is_active", "is_staff",
                                     "is_superuser", "email_verified")}),
        ("Security",     {"fields": ("password", "last_login", "last_login_ip")}),
        ("Permissions",  {"fields": ("groups", "user_permissions"),
                          "classes": ("collapse",)}),
        ("Timestamps",   {"fields": ("created_at", "updated_at"),
                          "classes": ("collapse",)}),
    )
    readonly_fields = ["last_login", "last_login_ip", "created_at", "updated_at"]

    # ── Add user form ─────────────────────────────────────────────────────────
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "full_name", "role", "password1", "password2"),
        }),
    )