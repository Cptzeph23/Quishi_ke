"""
FILE:     backend/apps/properties/tests/test_properties.py
PURPOSE:  Tests for property CRUD, filtering, permissions, view counter,
          featured endpoint, and save/unsave.
RUN:      pytest apps/properties/tests/test_properties.py -v
"""
import pytest

PROPERTIES_URL = "/api/v1/properties/"
FEATURED_URL   = "/api/v1/properties/featured/"
SAVED_URL      = "/api/v1/properties/saved/"
AMENITIES_URL  = "/api/v1/properties/amenities/"


def detail_url(prop_id):   return f"/api/v1/properties/{prop_id}/"
def save_url(prop_id):     return f"/api/v1/properties/{prop_id}/save/"


CREATE_PAYLOAD = {
    "title":         "Luxury Penthouse",
    "description":   "Top floor with panoramic views.",
    "property_type": "penthouse",
    "address":       "1 Kilimani Rise",
    "city":          "Nairobi",
    "neighborhood":  "Kilimani",
    "floor_number":  10,
    "house_number":  "PH1",
    "bedrooms":      3,
    "bathrooms":     2,
    "area_sqm":      "180.00",
    "price":         "350000.00",
    "status":        "available",
}


# ── List & Public Access ──────────────────────────────────────────────────────

@pytest.mark.django_db
class TestPropertyList:

    def test_public_can_list_properties(self, api_client, sample_property):
        res = api_client.get(PROPERTIES_URL)
        assert res.status_code == 200
        assert res.data["count"] >= 1

    def test_list_returns_summary_fields_only(self, api_client, sample_property):
        res = api_client.get(PROPERTIES_URL)
        result = res.data["results"][0]
        # Detail-only fields must NOT appear in list
        assert "description" not in result
        assert "images"      not in result
        # Summary fields must be present
        assert "primary_image" in result
        assert "amenity_count" in result

    def test_filter_by_city(self, api_client, sample_property):
        res = api_client.get(PROPERTIES_URL, {"city": "Nairobi"})
        assert res.status_code == 200
        assert all(p["city"] == "Nairobi" for p in res.data["results"])

    def test_filter_by_min_price(self, api_client, sample_property):
        res = api_client.get(PROPERTIES_URL, {"min_price": 100000})
        assert res.status_code == 200
        assert all(float(p["price"]) >= 100000 for p in res.data["results"])

    def test_filter_by_bedrooms(self, api_client, sample_property):
        res = api_client.get(PROPERTIES_URL, {"bedrooms": 1})
        assert res.status_code == 200
        assert all(p["bedrooms"] == 1 for p in res.data["results"])

    def test_search_by_title(self, api_client, sample_property):
        res = api_client.get(PROPERTIES_URL, {"search": "Westlands"})
        assert res.status_code == 200
        assert res.data["count"] >= 1

    def test_featured_endpoint(self, api_client, sample_property):
        res = api_client.get(FEATURED_URL)
        assert res.status_code == 200
        assert isinstance(res.data, list)
        assert len(res.data) >= 1


# ── Retrieve (Detail) ─────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestPropertyDetail:

    def test_public_can_retrieve_property(self, api_client, sample_property):
        res = api_client.get(detail_url(sample_property.id))
        assert res.status_code == 200
        assert res.data["title"] == sample_property.title
        assert "images"    in res.data
        assert "amenities" in res.data
        assert "listed_by" in res.data

    def test_retrieve_increments_view_count(self, api_client, sample_property):
        initial = sample_property.views_count
        api_client.get(detail_url(sample_property.id))
        sample_property.refresh_from_db()
        assert sample_property.views_count == initial + 1

    def test_retrieve_nonexistent_returns_404(self, api_client):
        import uuid
        res = api_client.get(detail_url(uuid.uuid4()))
        assert res.status_code == 404


# ── Create ────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestPropertyCreate:

    def test_agent_can_create_property(self, agent_token):
        res = agent_token.post(PROPERTIES_URL, CREATE_PAYLOAD, format="json")
        assert res.status_code == 201
        assert res.data["title"] == "Luxury Penthouse"
        # price_per_sqm is auto-computed
        assert float(res.data["price_per_sqm"]) > 0

    def test_admin_can_create_property(self, admin_token):
        res = admin_token.post(PROPERTIES_URL, CREATE_PAYLOAD, format="json")
        assert res.status_code == 201

    def test_client_cannot_create_property(self, client_token):
        res = client_token.post(PROPERTIES_URL, CREATE_PAYLOAD, format="json")
        assert res.status_code == 403

    def test_unauthenticated_cannot_create_property(self, api_client):
        res = api_client.post(PROPERTIES_URL, CREATE_PAYLOAD, format="json")
        assert res.status_code == 401

    def test_create_missing_required_field(self, agent_token):
        payload = CREATE_PAYLOAD.copy()
        del payload["price"]
        res = agent_token.post(PROPERTIES_URL, payload, format="json")
        assert res.status_code == 400


# ── Update & Delete ───────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestPropertyUpdateDelete:

    def test_owner_can_update_property(self, agent_token, sample_property):
        res = agent_token.patch(
            detail_url(sample_property.id), {"title": "Updated Title"}, format="json"
        )
        assert res.status_code == 200
        assert res.data["title"] == "Updated Title"

    def test_admin_can_update_any_property(self, admin_token, sample_property):
        res = admin_token.patch(
            detail_url(sample_property.id), {"is_featured": False}, format="json"
        )
        assert res.status_code == 200

    def test_other_agent_cannot_update_property(
        self, db, sample_property
    ):
        from apps.accounts.models import User
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework.test import APIClient

        other = User.objects.create_user(
            email="other@agent.com", full_name="Other Agent",
            password="Pass99!", role=User.Role.AGENT,
        )
        client = APIClient()
        token  = RefreshToken.for_user(other)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        res = client.patch(
            detail_url(sample_property.id), {"title": "Stolen Title"}, format="json"
        )
        assert res.status_code == 403

    def test_owner_can_delete_property(self, agent_token, sample_property):
        res = agent_token.delete(detail_url(sample_property.id))
        assert res.status_code == 204

    def test_client_cannot_delete_property(self, client_token, sample_property):
        res = client_token.delete(detail_url(sample_property.id))
        assert res.status_code == 403


# ── Save / Unsave ─────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestSaveProperty:

    def test_client_can_save_property(self, client_token, sample_property):
        res = client_token.post(save_url(sample_property.id))
        assert res.status_code == 200
        assert res.data["saved"] is True

    def test_saved_appears_in_saved_list(self, client_token, sample_property):
        client_token.post(save_url(sample_property.id))
        res = client_token.get(SAVED_URL)
        assert res.status_code == 200
        ids = [p["id"] for p in res.data]
        assert str(sample_property.id) in ids

    def test_client_can_unsave_property(self, client_token, sample_property):
        client_token.post(save_url(sample_property.id))
        res = client_token.delete(save_url(sample_property.id))
        assert res.status_code == 200
        assert res.data["saved"] is False

    def test_unauthenticated_cannot_save(self, api_client, sample_property):
        res = api_client.post(save_url(sample_property.id))
        assert res.status_code == 401


# ── Amenities ─────────────────────────────────────────────────────────────────

@pytest.mark.django_db
class TestAmenities:

    def test_public_can_list_amenities(self, api_client, sample_amenity):
        res = api_client.get(AMENITIES_URL)
        assert res.status_code == 200
        assert len(res.data) >= 1
        assert res.data[0]["name"] == "WiFi"