"""
FILE:     backend/apps/audit/models.py
PURPOSE:  Immutable audit log of every mutating API request
          Logged by AuditLogMiddleware automatically — no manual calls needed
"""
import uuid
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="audit_logs",
    )
    method       = models.CharField(max_length=10)       # POST PUT PATCH DELETE
    path         = models.CharField(max_length=500)
    status_code  = models.PositiveSmallIntegerField()
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    user_agent   = models.CharField(max_length=512, blank=True)
    request_body = models.JSONField(null=True, blank=True)
    duration_ms  = models.PositiveIntegerField(null=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["user"]),
            models.Index(fields=["path"]),
            models.Index(fields=["method"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["status_code"]),
        ]

    def __str__(self):
        user_str = self.user.email if self.user else "anon"
        return f"[{self.method}] {self.path} → {self.status_code} ({user_str})"