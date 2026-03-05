"""
FILE:     backend/apps/chatbot/admin.py
PURPOSE:  Admin registration for ChatSession and ChatMessage
"""
from django.contrib import admin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model         = ChatMessage
    extra         = 0
    fields        = ["role", "content", "extracted_filters", "created_at"]
    readonly_fields = ["created_at"]
    show_change_link = False

    def has_add_permission(self, request, obj=None): return False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display  = ["id", "user", "message_count", "created_at", "updated_at"]
    list_filter   = ["created_at"]
    search_fields = ["user__email", "session_key"]
    ordering      = ["-updated_at"]
    readonly_fields = ["created_at", "updated_at"]
    inlines       = [ChatMessageInline]

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = "Messages"


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = ["session", "role", "short_content", "created_at"]
    list_filter   = ["role", "created_at"]
    search_fields = ["content", "session__user__email"]
    ordering      = ["-created_at"]
    readonly_fields = ["created_at"]

    def short_content(self, obj):
        return obj.content[:80] + "…" if len(obj.content) > 80 else obj.content
    short_content.short_description = "Content"