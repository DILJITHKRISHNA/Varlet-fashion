"""Tests run against a throwaway database, `varlet_api_test`, on the local Postgres server."""

import os
import secrets

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

ADMIN_URL = os.environ.get(
    "TEST_ADMIN_DATABASE_URL", "postgresql+psycopg://postgres:postgres@127.0.0.1:54322/postgres"
)
TEST_DB = "varlet_api_test"

if make_url(ADMIN_URL).host not in ("127.0.0.1", "localhost"):
    raise RuntimeError("Tests wipe their database and only run against a local server.")

# Set before the app is imported; these win over backend/.env.
os.environ.update(
    ENVIRONMENT="test",
    DATABASE_URL=make_url(ADMIN_URL).set(database=TEST_DB).render_as_string(hide_password=False),
    JWT_SECRET=secrets.token_urlsafe(48),
    RATE_LIMIT_ENABLED="false",
    GEMINI_API_KEY="",
)


@pytest.fixture(scope="session", autouse=True)
def database():
    admin = create_engine(ADMIN_URL, isolation_level="AUTOCOMMIT")
    with admin.connect() as connection:
        connection.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB} WITH (FORCE)"))
        connection.execute(text(f"CREATE DATABASE {TEST_DB}"))

    from alembic import command
    from alembic.config import Config

    from app.core.config import BACKEND_DIR
    from app.db import get_engine

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    command.upgrade(config, "head")
    yield
    get_engine().dispose()
    with admin.connect() as connection:
        connection.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB} WITH (FORCE)"))
    admin.dispose()


@pytest.fixture(autouse=True)
def clean(database):
    from app.core import ratelimit
    from app.db import get_engine
    from app.models import Base

    tables = ", ".join(t.fullname for t in Base.metadata.sorted_tables)
    with get_engine().begin() as connection:
        connection.execute(text(f"TRUNCATE {tables} CASCADE"))
    ratelimit.reset()


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    return TestClient(app)


PASSWORD = "test-password-123"
SHOP = {
    "name": "Thread House",
    "category": "Streetwear",
    "location_text": "MG Road, Bengaluru",
    "lat": 12.9757,
    "lng": 77.607,
}


def bearer(session: dict) -> dict:
    return {"Authorization": f"Bearer {session['access_token']}"}


@pytest.fixture
def make_shopper(client):
    def make(email="shopper@example.com", name="Asha"):
        response = client.post(
            "/api/v1/auth/register", json={"name": name, "email": email, "password": PASSWORD}
        )
        assert response.status_code == 201, response.text
        return response.json()

    return make


@pytest.fixture
def make_owner(client):
    def make(email="owner@example.com", **shop):
        response = client.post(
            "/api/v1/shops/register",
            json={
                "owner_name": "Ravi",
                "email": email,
                "password": PASSWORD,
                "shop": {**SHOP, **shop},
            },
        )
        assert response.status_code == 201, response.text
        return response.json()

    return make


@pytest.fixture
def make_product(client):
    def make(session, **fields):
        body = {"name": "Oversized Graphic Tee", "price": 799, **fields}
        response = client.post("/api/v1/shops/mine/products", json=body, headers=bearer(session))
        assert response.status_code == 201, response.text
        return response.json()

    return make
