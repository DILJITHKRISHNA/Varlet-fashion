from datetime import UTC, datetime, timedelta

import jwt

from tests.conftest import PASSWORD, bearer

API = "/api/v1/auth"


def test_register_login_and_profile(client, make_shopper):
    session = make_shopper(email="Asha@Example.com")
    assert session["user"]["role"] == "consumer"
    assert session["user"]["email"] == "asha@example.com"
    assert "password_hash" not in session["user"]

    login = client.post(f"{API}/login", json={"email": "ASHA@example.com", "password": PASSWORD})
    assert login.status_code == 200
    me = client.get(f"{API}/me", headers=bearer(login.json()))
    assert me.json()["name"] == "Asha"

    patched = client.patch(
        f"{API}/me", json={"fashion_preferences": ["Streetwear"]}, headers=bearer(session)
    )
    assert patched.json()["fashion_preferences"] == ["Streetwear"]


def test_cannot_choose_own_role_or_shop(client, make_shopper):
    body = {"name": "Eve", "email": "eve@example.com", "password": PASSWORD}
    assert client.post(f"{API}/register", json={**body, "role": "super_admin"}).status_code == 422

    session = make_shopper()
    for change in ({"role": "super_admin"}, {"shop_id": session["user"]["id"]}, {"name": None}):
        response = client.patch(f"{API}/me", json=change, headers=bearer(session))
        assert response.status_code == 422, change
    assert client.get(f"{API}/me", headers=bearer(session)).json()["role"] == "consumer"


def test_bad_credentials_look_the_same(client, make_shopper):
    make_shopper()
    wrong = client.post(
        f"{API}/login", json={"email": "shopper@example.com", "password": "wrong-password"}
    )
    unknown = client.post(
        f"{API}/login", json={"email": "nobody@example.com", "password": "wrong-password"}
    )
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_duplicate_email_and_weak_password(client, make_shopper):
    make_shopper()
    again = client.post(
        f"{API}/register",
        json={"name": "Two", "email": "SHOPPER@example.com", "password": PASSWORD},
    )
    assert again.status_code == 409
    weak = client.post(
        f"{API}/register", json={"name": "Two", "email": "two@example.com", "password": "short"}
    )
    assert weak.status_code == 422


def test_refresh_rotates_and_reuse_ends_all_sessions(client, make_shopper):
    first = make_shopper()
    second = client.post(f"{API}/refresh", json={"refresh_token": first["refresh_token"]})
    assert second.status_code == 200
    assert second.json()["refresh_token"] != first["refresh_token"]

    reused = client.post(f"{API}/refresh", json={"refresh_token": first["refresh_token"]})
    assert reused.status_code == 401
    after = client.post(f"{API}/refresh", json={"refresh_token": second.json()["refresh_token"]})
    assert after.status_code == 401


def test_logout_revokes_refresh_token(client, make_shopper):
    session = make_shopper()
    token = {"refresh_token": session["refresh_token"]}
    assert client.post(f"{API}/logout", json=token).status_code == 204
    assert client.post(f"{API}/refresh", json=token).status_code == 401


def test_forged_and_expired_tokens_are_rejected(client, make_shopper):
    user_id = make_shopper()["user"]["id"]
    later = datetime.now(UTC) + timedelta(hours=1)
    forged = jwt.encode(
        {"sub": user_id, "type": "access", "exp": later}, "x" * 48, algorithm="HS256"
    )
    unsigned = jwt.encode({"sub": user_id, "type": "access", "exp": later}, None, algorithm="none")
    from app.core.config import get_settings

    expired = jwt.encode(
        {"sub": user_id, "type": "access", "exp": datetime.now(UTC) - timedelta(minutes=1)},
        get_settings().jwt_secret,
        algorithm="HS256",
    )
    for token in (forged, unsigned, expired, "garbage"):
        response = client.get(f"{API}/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401
    assert client.get(f"{API}/me").status_code == 401


def test_login_is_rate_limited(client, monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "rate_limit_enabled", True)
    body = {"email": "nobody@example.com", "password": "wrong-password"}
    codes = [client.post(f"{API}/login", json=body).status_code for _ in range(11)]
    assert codes == [401] * 10 + [429]
