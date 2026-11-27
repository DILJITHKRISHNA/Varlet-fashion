from datetime import UTC, datetime, timedelta

from tests.conftest import bearer

API = "/api/v1"


def later(days):
    return (datetime.now(UTC) + timedelta(days=days)).isoformat()


def test_only_running_offers_are_public(client, make_owner, make_product):
    owner = make_owner()
    headers = bearer(owner)
    product = make_product(owner)

    def add(**body):
        return client.post(f"{API}/shops/mine/offers", json=body, headers=headers)

    live = add(title="Weekend sale", discount_percent=20, product_ids=[product["id"]])
    assert live.status_code == 201, live.text
    assert add(title="Next month", starts_at=later(30), ends_at=later(40)).status_code == 201
    assert add(title="Paused", is_active=False).status_code == 201
    assert add(title="Already over", ends_at=later(-1)).status_code == 422
    assert add(title="Too big", discount_percent=95).status_code == 422
    public = client.get(f"{API}/offers", params={"lat": 12.9757, "lng": 77.607}).json()
    assert [o["title"] for o in public] == ["Weekend sale"]
    assert public[0]["shop_name"] == "Thread House"
    assert len(client.get(f"{API}/shops/mine/offers", headers=headers).json()) == 3

    url = f"{API}/shops/mine/offers/{live.json()['id']}"
    assert client.patch(url, json={"ends_at": later(-5)}, headers=headers).status_code == 422
    assert client.patch(url, json={"is_active": False}, headers=headers).status_code == 200
    assert client.get(f"{API}/offers").json() == []
    assert client.delete(url, headers=headers).status_code == 204


def test_offers_stay_inside_the_store(client, make_owner, make_product):
    owner = make_owner()
    rival = make_owner(email="rival@example.com", name="Rival")
    theirs = make_product(rival)
    response = client.post(
        f"{API}/shops/mine/offers",
        json={"title": "Not mine", "product_ids": [theirs["id"]]},
        headers=bearer(owner),
    )
    assert response.status_code == 422


def test_enquiries_are_counted_per_store(client, make_owner, make_product, make_shopper):
    owner = make_owner()
    rival = make_owner(email="rival@example.com", name="Rival")
    product = make_product(owner)
    shop_id = owner["shop"]["id"]
    shopper = bearer(make_shopper())

    def tap(kind, headers=None, **extra):
        body = {"shop_id": shop_id, "kind": kind, **extra}
        return client.post(f"{API}/enquiries", json=body, headers=headers or {})

    assert tap("whatsapp", product_id=product["id"]).status_code == 201
    assert tap("whatsapp", shopper, product_id=product["id"]).status_code == 201
    assert tap("call").status_code == 201
    assert tap("directions").status_code == 201
    assert tap("email").status_code == 422
    wrong = client.post(
        f"{API}/enquiries",
        json={"shop_id": rival["shop"]["id"], "kind": "call", "product_id": product["id"]},
    )
    assert wrong.status_code == 422

    summary = client.get(
        f"{API}/shops/mine/enquiries/summary", params={"days": 7}, headers=bearer(owner)
    ).json()
    assert summary["total"] == 4
    assert summary["totals"] == {"whatsapp": 2, "call": 1, "directions": 1}
    assert len(summary["by_day"]) == 7 and summary["by_day"][-1]["whatsapp"] == 2
    assert summary["top_products"][0]["count"] == 2
    recent = client.get(f"{API}/shops/mine/enquiries", headers=bearer(owner)).json()
    assert len(recent) == 4 and "customer_name" not in recent[0]
    other = client.get(f"{API}/shops/mine/enquiries/summary", headers=bearer(rival)).json()
    assert other["total"] == 0
