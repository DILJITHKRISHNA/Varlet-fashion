from tests.conftest import PASSWORD, SHOP, bearer

API = "/api/v1"


def test_owner_and_shop_are_created_together(client, make_owner):
    session = make_owner()
    assert session["user"]["role"] == "admin"
    assert session["user"]["shop_id"] == session["shop"]["id"]
    mine = client.get(f"{API}/shops/mine", headers=bearer(session))
    assert mine.json()["name"] == "Thread House"
    login = client.post(
        f"{API}/auth/login", json={"email": "owner@example.com", "password": PASSWORD}
    )
    assert login.json()["user"]["shop_id"] == session["shop"]["id"]


def test_failed_registration_leaves_nothing_behind(client, make_shopper):
    make_shopper(email="owner@example.com")
    response = client.post(
        f"{API}/shops/register",
        json={
            "owner_name": "Ravi",
            "email": "owner@example.com",
            "password": PASSWORD,
            "shop": SHOP,
        },
    )
    assert response.status_code == 409
    assert client.get(f"{API}/shops").json() == []

    bad_location = client.post(
        f"{API}/shops/register",
        json={
            "owner_name": "Ravi",
            "email": "new@example.com",
            "password": PASSWORD,
            "shop": {**SHOP, "lat": 200},
        },
    )
    assert bad_location.status_code == 422


def test_signed_in_shopper_can_open_one_store(client, make_shopper):
    session = make_shopper()
    created = client.post(f"{API}/shops", json=SHOP, headers=bearer(session))
    assert created.status_code == 201
    assert client.get(f"{API}/auth/me", headers=bearer(session)).json()["role"] == "admin"
    assert client.post(f"{API}/shops", json=SHOP, headers=bearer(session)).status_code == 409
    assert client.post(f"{API}/shops", json=SHOP).status_code == 401


def test_nearby_is_filtered_and_sorted_by_distance(client, make_owner):
    make_owner(email="a@example.com", name="Far Store", lat=12.9352, lng=77.6245)
    make_owner(email="b@example.com", name="Near Store", lat=12.9760, lng=77.6071)
    make_owner(email="c@example.com", name="Delhi Store", lat=28.6139, lng=77.2090)
    found = client.get(f"{API}/shops/nearby", params={"lat": 12.9757, "lng": 77.607}).json()
    assert [s["name"] for s in found] == ["Near Store", "Far Store"]
    assert found[0]["distance_km"] < 0.2
    assert 4 < found[1]["distance_km"] < 6


def test_follow_counts_once(client, make_owner, make_shopper):
    shop_id = make_owner()["shop"]["id"]
    headers = bearer(make_shopper())
    for _ in range(2):
        assert client.put(f"{API}/me/following/{shop_id}", headers=headers).status_code == 204
    assert client.get(f"{API}/shops/{shop_id}").json()["follower_count"] == 1
    assert [s["id"] for s in client.get(f"{API}/me/following", headers=headers).json()] == [shop_id]
    for _ in range(2):
        client.delete(f"{API}/me/following/{shop_id}", headers=headers)
    assert client.get(f"{API}/shops/{shop_id}").json()["follower_count"] == 0


def test_shoppers_cannot_use_store_tools(client, make_shopper):
    headers = bearer(make_shopper())
    assert client.get(f"{API}/shops/mine", headers=headers).status_code == 403
    assert client.get(f"{API}/shops/mine/enquiries/summary", headers=headers).status_code == 403
    assert client.get(f"{API}/shops/mine").status_code == 401
