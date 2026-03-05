"""
FILE:     backend/apps/chatbot/views.py
PURPOSE:  Chat endpoint — POST to send, GET to retrieve session history
"""
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ChatSession, ChatMessage
from .serializers import ChatInputSerializer, ChatSessionSerializer, ChatMessageSerializer
from .services import get_ai_response


class ChatView(APIView):
    """
    POST /api/v1/chatbot/
    Body: { "message": "...", "session_id": "<uuid or null>" }
    Returns: { "session_id": "...", "message": {...}, "filters": {...} | null }

    GET /api/v1/chatbot/?session_id=<uuid>
    Returns: full session with message history
    """
    # Chatbot is open to everyone — anonymous users get a session_key-based session.
    # Authenticated users have their chat history tied to their account.
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = ChatInputSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        user_message = s.validated_data["message"]
        session_id   = s.validated_data.get("session_id")

        # Resolve or create chat session
        session = None
        if session_id:
            try:
                session = ChatSession.objects.get(pk=session_id)
            except ChatSession.DoesNotExist:
                pass

        if session is None:
            session = ChatSession.objects.create(
                user=request.user if request.user.is_authenticated else None
            )

        # Build message history (last 20 messages = 10 exchanges)
        history = list(
            session.messages.order_by("-created_at")[:20]
                           .values("role", "content")
        )[::-1]  # reverse to chronological order

        # Persist user message
        ChatMessage.objects.create(session=session, role="user", content=user_message)

        # Append current message and call AI
        history.append({"role": "user", "content": user_message})
        try:
            ai_text, filters = get_ai_response(history)
        except Exception as exc:
            ai_text = (
                "I'm having trouble connecting to the AI service right now. "
                "Please try again in a moment."
            )
            filters = None

        # Persist assistant reply
        reply = ChatMessage.objects.create(
            session           = session,
            role              = "assistant",
            content           = ai_text,
            extracted_filters = filters,
        )

        return Response({
            "session_id": str(session.id),
            "message":    ChatMessageSerializer(reply).data,
            "filters":    filters,
        })

    def get(self, request):
        session_id = request.query_params.get("session_id")
        if not session_id:
            return Response({"detail": "session_id query param required."}, status=400)
        try:
            session = ChatSession.objects.prefetch_related("messages").get(pk=session_id)
        except ChatSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=404)
        return Response(ChatSessionSerializer(session).data)