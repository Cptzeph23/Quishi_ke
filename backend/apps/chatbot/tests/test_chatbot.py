"""
FILE:     backend/apps/chatbot/tests/test_chatbot.py
PURPOSE:  Tests for chatbot send message, session continuity, and history.
          AI calls are mocked — no API keys required to run tests.
RUN:      pytest apps/chatbot/tests/test_chatbot.py -v
"""
import pytest
from unittest.mock import patch

CHAT_URL = "/api/v1/chatbot/"


def _mock_ai(text="Here are some options.", filters=None):
    """Patch get_ai_response to return a deterministic tuple."""
    return patch(
        "apps.chatbot.views.get_ai_response",
        return_value=(text, filters),
    )


# ── Send message ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestChatSend:

    def test_anonymous_user_can_send_message(self, api_client):
        with _mock_ai("Hello! How can I help?"):
            res = api_client.post(CHAT_URL, {"message": "Hello"}, format="json")
        assert res.status_code == 200
        assert "session_id" in res.data
        assert res.data["message"]["role"] == "assistant"
        assert res.data["message"]["content"] == "Hello! How can I help?"

    def test_authenticated_user_can_send_message(self, client_token):
        with _mock_ai("Great choice of city!"):
            res = client_token.post(
                CHAT_URL, {"message": "Show me apartments in Nairobi"}, format="json"
            )
        assert res.status_code == 200
        assert res.data["session_id"] is not None

    def test_ai_filters_returned_in_response(self, api_client):
        filters = {"city": "Nairobi", "property_type": "apartment", "bedrooms": 2}
        with _mock_ai("Found some great apartments!", filters):
            res = api_client.post(
                CHAT_URL,
                {"message": "2 bed apartment in Nairobi"},
                format="json",
            )
        assert res.status_code == 200
        assert res.data["filters"] == filters
        assert res.data["message"]["extracted_filters"] == filters

    def test_no_filters_when_ai_returns_none(self, api_client):
        with _mock_ai("Welcome to SmartRealty!", filters=None):
            res = api_client.post(CHAT_URL, {"message": "Hi there"}, format="json")
        assert res.status_code == 200
        assert res.data["filters"] is None

    def test_empty_message_rejected(self, api_client):
        res = api_client.post(CHAT_URL, {"message": ""}, format="json")
        assert res.status_code == 400

    def test_missing_message_field_rejected(self, api_client):
        res = api_client.post(CHAT_URL, {}, format="json")
        assert res.status_code == 400


# ── Session continuity ────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestChatSession:

    def test_subsequent_message_reuses_session(self, api_client):
        with _mock_ai("First reply"):
            r1 = api_client.post(CHAT_URL, {"message": "Hello"}, format="json")
        session_id = r1.data["session_id"]

        with _mock_ai("Second reply"):
            r2 = api_client.post(
                CHAT_URL,
                {"message": "Tell me more", "session_id": session_id},
                format="json",
            )
        assert r2.status_code == 200
        assert r2.data["session_id"] == session_id

    def test_invalid_session_id_creates_new_session(self, api_client):
        import uuid
        with _mock_ai("Fresh start"):
            res = api_client.post(
                CHAT_URL,
                {"message": "Hello", "session_id": str(uuid.uuid4())},
                format="json",
            )
        assert res.status_code == 200
        assert res.data["session_id"] is not None


# ── History ───────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestChatHistory:

    def test_get_session_history(self, api_client):
        with _mock_ai("Reply A"):
            r = api_client.post(CHAT_URL, {"message": "Msg A"}, format="json")
        session_id = r.data["session_id"]

        res = api_client.get(CHAT_URL, {"session_id": session_id})
        assert res.status_code == 200
        assert res.data["id"] == session_id
        assert len(res.data["messages"]) == 2  # user + assistant

    def test_history_without_session_id_returns_400(self, api_client):
        res = api_client.get(CHAT_URL)
        assert res.status_code == 400

    def test_history_nonexistent_session_returns_404(self, api_client):
        import uuid
        res = api_client.get(CHAT_URL, {"session_id": str(uuid.uuid4())})
        assert res.status_code == 404

    def test_ai_failure_returns_graceful_error_message(self, api_client):
        with patch(
            "apps.chatbot.views.get_ai_response",
            side_effect=Exception("OpenAI timeout"),
        ):
            res = api_client.post(CHAT_URL, {"message": "Hello"}, format="json")
        assert res.status_code == 200
        assert "trouble" in res.data["message"]["content"].lower()