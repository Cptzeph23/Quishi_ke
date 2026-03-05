"""
FILE:     backend/apps/accounts/tests/test_auth.py
PURPOSE:  Tests for registration, login, token refresh, profile, and logout.
RUN:      pytest apps/accounts/tests/test_auth.py -v
"""
import pytest


REGISTER_URL     = "/api/v1/auth/register/"
LOGIN_URL        = "/api/v1/auth/login/"
REFRESH_URL      = "/api/v1/auth/token/refresh/"
LOGOUT_URL       = "/api/v1/auth/token/logout/"
ME_URL           = "/api/v1/auth/me/"


# ── Registration ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestRegister:

    def test_register_client_success(self, api_client):
        payload = {
            "email":     "new@example.com",
            "full_name": "New User",
            "password":  "SecurePass99!",
            "password2": "SecurePass99!",
            "role":      "client",
        }
        res = api_client.post(REGISTER_URL, payload)
        assert res.status_code == 201
        assert res.data["email"] == "new@example.com"
        assert "password" not in res.data

    def test_register_agent_success(self, api_client):
        payload = {
            "email":     "agent_new@example.com",
            "full_name": "New Agent",
            "password":  "SecurePass99!",
            "password2": "SecurePass99!",
            "role":      "agent",
        }
        res = api_client.post(REGISTER_URL, payload)
        assert res.status_code == 201
        assert res.data["role"] == "agent"

    def test_register_duplicate_email(self, api_client, client_user):
        payload = {
            "email":     client_user.email,
            "full_name": "Duplicate",
            "password":  "SecurePass99!",
            "password2": "SecurePass99!",
        }
        res = api_client.post(REGISTER_URL, payload)
        assert res.status_code == 400

    def test_register_password_mismatch(self, api_client):
        payload = {
            "email":     "mismatch@example.com",
            "full_name": "Mismatch User",
            "password":  "SecurePass99!",
            "password2": "WrongPass99!",
        }
        res = api_client.post(REGISTER_URL, payload)
        assert res.status_code == 400
        assert "password" in res.data

    def test_register_cannot_self_promote_to_admin(self, api_client):
        payload = {
            "email":     "fakeadmin@example.com",
            "full_name": "Fake Admin",
            "password":  "SecurePass99!",
            "password2": "SecurePass99!",
            "role":      "admin",
        }
        res = api_client.post(REGISTER_URL, payload)
        assert res.status_code == 400

    def test_register_weak_password_rejected(self, api_client):
        payload = {
            "email":     "weak@example.com",
            "full_name": "Weak Pass",
            "password":  "123",
            "password2": "123",
        }
        res = api_client.post(REGISTER_URL, payload)
        assert res.status_code == 400


# ── Login ─────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestLogin:

    def test_login_success_returns_tokens_and_user(self, api_client, client_user):
        res = api_client.post(LOGIN_URL, {
            "email":    client_user.email,
            "password": "Cl!entPass99",
        })
        assert res.status_code == 200
        assert "access"  in res.data
        assert "refresh" in res.data
        assert "user"    in res.data
        assert res.data["user"]["email"] == client_user.email
        assert res.data["user"]["role"]  == "client"

    def test_login_wrong_password(self, api_client, client_user):
        res = api_client.post(LOGIN_URL, {
            "email":    client_user.email,
            "password": "WrongPassword!",
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, api_client):
        res = api_client.post(LOGIN_URL, {
            "email":    "nobody@example.com",
            "password": "AnyPass99!",
        })
        assert res.status_code == 401

    def test_login_inactive_user_rejected(self, api_client, client_user):
        client_user.is_active = False
        client_user.save()
        res = api_client.post(LOGIN_URL, {
            "email":    client_user.email,
            "password": "Cl!entPass99",
        })
        assert res.status_code == 401


# ── Token Refresh ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestTokenRefresh:

    def test_refresh_returns_new_access_token(self, api_client, client_user):
        login = api_client.post(LOGIN_URL, {
            "email":    client_user.email,
            "password": "Cl!entPass99",
        })
        res = api_client.post(REFRESH_URL, {"refresh": login.data["refresh"]})
        assert res.status_code == 200
        assert "access" in res.data

    def test_refresh_with_invalid_token(self, api_client):
        res = api_client.post(REFRESH_URL, {"refresh": "not-a-valid-token"})
        assert res.status_code == 401


# ── Profile ───────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestProfile:

    def test_me_returns_own_profile(self, client_token, client_user):
        res = client_token.get(ME_URL)
        assert res.status_code == 200
        assert res.data["email"]     == client_user.email
        assert res.data["full_name"] == client_user.full_name

    def test_me_unauthenticated_returns_401(self, api_client):
        res = api_client.get(ME_URL)
        assert res.status_code == 401

    def test_me_patch_updates_name(self, client_token):
        res = client_token.patch(ME_URL, {"full_name": "Updated Name"})
        assert res.status_code == 200
        assert res.data["full_name"] == "Updated Name"

    def test_me_cannot_change_role(self, client_token):
        res = client_token.patch(ME_URL, {"role": "admin"})
        # role is not in UpdateSerializer fields — ignored, not error
        assert res.status_code == 200
        assert res.data["role"] == "client"


# ── Logout ────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestLogout:

    def test_logout_blacklists_token(self, api_client, client_user):
        login   = api_client.post(LOGIN_URL, {
            "email":    client_user.email,
            "password": "Cl!entPass99",
        })
        refresh = login.data["refresh"]
        api_client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        res = api_client.post(LOGOUT_URL, {"refresh": refresh})
        assert res.status_code == 200

        # Attempting to refresh with the blacklisted token should now fail
        res2 = api_client.post(REFRESH_URL, {"refresh": refresh})
        assert res2.status_code == 401