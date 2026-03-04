"""
FILE:     backend/apps/chatbot/urls.py
PURPOSE:  URL patterns for chatbot namespace
"""
from django.urls import path
from .views import ChatView

app_name = "chatbot"

urlpatterns = [
    path("", ChatView.as_view(), name="chat"),
]