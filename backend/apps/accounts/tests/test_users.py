"""
FILE:     backend/apps/accounts/tests/test_users.py
PURPOSE:  Tests for admin user management — list, retrieve, update, delete.
RUN:      pytest apps/accounts/tests/test_users.py -v
"""
import pytest

USERS_URL = "/api/v1/auth/users/"


def user_detail_url(user_id):
    return f"/api/v1/auth/users/{user_id}/"


# ── List users ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestUserList:

    def test_admin_can_list_users(self, admin_token, client_user, agent_user):
        res = admin_token.get(USERS_URL)
        assert res.status_code == 200
        assert res.data["count"] >= 2

    def test_agent_cannot_list_users(self, agent_token):
        res = agent_token.get(USERS_URL)
        assert res.status_code == 403

    def test_client_cannot_list_users(self, client_token):
        res = client_token.get(USERS_URL)
        assert res.status_code == 403

    def test_unauthenticated_cannot_list_users(self, api_client):
        res = api_client.get(USERS_URL)
        assert res.status_code == 401

    def test_filter_by_role(self, admin_token, client_user, agent_user):
        res = admin_token.get(USERS_URL, {"role": "client"})
        assert res.status_code == 200
        assert all(u["role"] == "client" for u in res.data["results"])

    def test_search_by_email(self, admin_token, client_user):
        res = admin_token.get(USERS_URL, {"search": client_user.email})
        assert res.status_code == 200
        emails = [u["email"] for u in res.data["results"]]
        assert client_user.email in emails


# ── Retrieve / update / delete ────────────────────────────────────────────────

@pytest.mark.django_db
class TestUserDetail:

    def test_admin_can_retrieve_user(self, admin_token, client_user):
        res = admin_token.get(user_detail_url(client_user.id))
        assert res.status_code == 200
        assert res.data["email"] == client_user.email

    def test_admin_can_deactivate_user(self, admin_token, client_user):
        res = admin_token.patch(
            user_detail_url(client_user.id), {"is_active": False}
        )
        assert res.status_code == 200

    def test_admin_can_delete_user(self, admin_token, client_user):
        res = admin_token.delete(user_detail_url(client_user.id))
        assert res.status_code == 204

    def test_non_admin_cannot_access_user_detail(self, client_token, agent_user):
        res = client_token.get(user_detail_url(agent_user.id))
        assert res.status_code == 403