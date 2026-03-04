"""
FILE:     backend/apps/audit/admin.py
PURPOSE:  Read-only audit log viewer in Django admin
"""
from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display    = ["method", "path", "status_code", "user", "ip_address",
                       "duration_ms", "created_at"]
    list_filter     = ["method", "status_code"]
    search_fields   = ["path", "user__email", "ip_address"]
    readonly_fields = [f.name for f in AuditLog._meta.fields]
    ordering        = ["-created_at"]

    def has_add_permission(self, request):    return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return False