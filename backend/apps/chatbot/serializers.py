"""
FILE:     backend/apps/chatbot/serializers.py
PURPOSE:  Chatbot input/output serializers
"""
from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ChatMessage
        fields = ["id", "role", "content", "extracted_filters", "created_at"]


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model  = ChatSession
        fields = ["id", "messages", "created_at", "updated_at"]


class ChatInputSerializer(serializers.Serializer):
    message    = serializers.CharField(max_length=2000)
    session_id = serializers.UUIDField(required=False, allow_null=True)