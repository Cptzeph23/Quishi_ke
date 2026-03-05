"""
FILE:     backend/apps/analytics/tests/test_analytics.py
PURPOSE:  Tests for admin analytics — dashboard, property stats, audit log viewer.
RUN:      pytest apps/analytics/tests/test_analytics.py -v
"""
import pytest

DASHBOARD_URL    = "/api/v1/analytics/dashboard/"
PROP_STATS_URL   = "/api/v1/analytics/properties/"
AUDIT_LOGS_URL   = "/api/v1/analytics/audit-logs/"


# ── Dashboard ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestDashboardStats:

    def test_admin_can_access_dashboard(self, admin_token, sample_property):
        res = admin_token.get(DASHBOARD_URL)
        assert res.status_code == 200

        expected_keys = [
            "total_properties", "available_properties", "featured_properties",
            "avg_price", "total_views",
            "total_users", "total_agents", "total_clients",
            "new_users_this_month", "api_calls_today",
        ]
        for key in expected_keys:
            assert key in res.data, f"Missing key: {key}"

    def test_dashboard_counts_are_accurate(
        self, admin_token, sample_property, agent_user, client_user
    ):
        res = admin_token.get(DASHBOARD_URL)
        assert res.data["total_properties"]     >= 1
        assert res.data["available_properties"] >= 1
        assert res.data["featured_properties"]  >= 1
        assert res.data["total_agents"]         >= 1
        assert res.data["total_clients"]        >= 1

    def test_agent_cannot_access_dashboard(self, agent_token):
        res = agent_token.get(DASHBOARD_URL)
        assert res.status_code == 403

    def test_client_cannot_access_dashboard(self, client_token):
        res = client_token.get(DASHBOARD_URL)
        assert res.status_code == 403

    def test_unauthenticated_cannot_access_dashboard(self, api_client):
        res = api_client.get(DASHBOARD_URL)
        assert res.status_code == 401


# ── Property Stats ────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestPropertyStats:

    def test_admin_can_access_property_stats(self, admin_token, sample_property):
        res = admin_token.get(PROP_STATS_URL)
        assert res.status_code == 200
        assert "by_type"   in res.data
        assert "by_city"   in res.data
        assert "by_status" in res.data

    def test_by_type_contains_correct_structure(self, admin_token, sample_property):
        res = admin_token.get(PROP_STATS_URL)
        by_type = res.data["by_type"]
        assert len(by_type) >= 1
        assert "property_type" in by_type[0]
        assert "count"         in by_type[0]
        assert "avg_price"     in by_type[0]

    def test_by_city_contains_nairobi(self, admin_token, sample_property):
        res = admin_token.get(PROP_STATS_URL)
        cities = [row["city"] for row in res.data["by_city"]]
        assert "Nairobi" in cities

    def test_non_admin_cannot_access_property_stats(self, client_token):
        res = client_token.get(PROP_STATS_URL)
        assert res.status_code == 403


# ── Audit Log ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestAuditLogs:

    def test_admin_can_list_audit_logs(self, admin_token):
        res = admin_token.get(AUDIT_LOGS_URL)
        assert res.status_code == 200
        assert "count"   in res.data
        assert "results" in res.data

    def test_audit_log_entry_has_required_fields(self, admin_token, api_client):
        # Generate an audit log entry via a POST call
        api_client.post("/api/v1/auth/register/", {
            "email": "audit_test@example.com",
            "full_name": "Audit Test",
            "password": "AuditPass99!",
            "password2": "AuditPass99!",
        })
        res = admin_token.get(AUDIT_LOGS_URL)
        assert res.status_code == 200
        if res.data["count"] > 0:
            entry = res.data["results"][0]
            for field in ["id", "method", "path", "status_code", "created_at"]:
                assert field in entry, f"Missing field: {field}"

    def test_filter_audit_logs_by_method(self, admin_token):
        res = admin_token.get(AUDIT_LOGS_URL, {"method": "POST"})
        assert res.status_code == 200
        for entry in res.data["results"]:
            assert entry["method"] == "POST"

    def test_non_admin_cannot_view_audit_logs(self, agent_token):
        res = agent_token.get(AUDIT_LOGS_URL)
        assert res.status_code == 403