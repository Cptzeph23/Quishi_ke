"""
FILE:     backend/conftest.py
PURPOSE:  Shared pytest fixtures available to all test modules.
          Provides: api_client, admin_user, agent_user, client_user,
                    admin_token, agent_token, client_token,
                    sample_amenity, sample_property
"""
import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.properties.models import Amenity, Property


# ── Users ─────────────────────────────────────────────────────────────────────

@pytest.fixture
def api_client():
    """Unauthenticated DRF test client."""
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email     = "admin@smartrealty.test",
        full_name = "Admin User",
        password  = "Adm!nPass99",
        role      = User.Role.ADMIN,
        is_staff  = True,
    )


@pytest.fixture
def agent_user(db):
    return User.objects.create_user(
        email     = "agent@smartrealty.test",
        full_name = "Agent User",
        password  = "Ag3ntPass99",
        role      = User.Role.AGENT,
    )


@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        email     = "client@smartrealty.test",
        full_name = "Client User",
        password  = "Cl!entPass99",
        role      = User.Role.CLIENT,
    )


# ── Auth helpers ──────────────────────────────────────────────────────────────

def _bearer(user):
    """Return an APIClient already authenticated as `user`."""
    client = APIClient()
    token  = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return client


@pytest.fixture
def admin_token(admin_user):
    return _bearer(admin_user)


@pytest.fixture
def agent_token(agent_user):
    return _bearer(agent_user)


@pytest.fixture
def client_token(client_user):
    return _bearer(client_user)


# ── Domain objects ────────────────────────────────────────────────────────────

@pytest.fixture
def sample_amenity(db):
    return Amenity.objects.create(name="WiFi", icon="wifi")


@pytest.fixture
def sample_property(db, agent_user, sample_amenity):
    prop = Property.objects.create(
        title         = "Modern Studio in Westlands",
        description   = "A bright studio apartment with great city views.",
        property_type = Property.PropType.STUDIO,
        address       = "12 Westlands Road",
        city          = "Nairobi",
        neighborhood  = "Westlands",
        floor_number  = 3,
        house_number  = "3B",
        bedrooms      = 1,
        bathrooms     = 1,
        area_sqm      = "45.00",
        price         = "55000.00",
        status        = Property.Status.AVAILABLE,
        listed_by     = agent_user,
        is_featured   = True,
    )
    prop.amenities.add(sample_amenity)
    return prop