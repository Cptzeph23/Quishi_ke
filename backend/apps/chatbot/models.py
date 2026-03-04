"""
FILE:     backend/apps/chatbot/models.py
PURPOSE:  Chat session and message persistence
          — sessions can belong to authenticated or anonymous users
"""
import uuid
from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="chat_sessions",
    )
    session_key = models.CharField(max_length=100, blank=True,
                                   help_text="For anonymous user sessions")
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chat_sessions"
        ordering = ["-updated_at"]

    def __str__(self):
        owner = self.user.email if self.user else self.session_key or "anon"
        return f"Session {self.id} ({owner})"


class ChatMessage(models.Model):
    class Role(models.TextChoices):
        USER      = "user",      "User"
        ASSISTANT = "assistant", "Assistant"

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session           = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role              = models.CharField(max_length=10, choices=Role.choices)
    content           = models.TextField()
    extracted_filters = models.JSONField(null=True, blank=True,
                                         help_text="Structured filters extracted from natural language")
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_messages"
        ordering = ["created_at"]