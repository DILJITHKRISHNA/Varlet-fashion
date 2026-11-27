from tests.conftest import bearer

API = "/api/v1"


def test_search_price_brand_and_collections(client, make_owner, make_product):
    owner = make_owner()
    make_product(owner, name="Black Cargo Pants", brand="Roadster", price=1499)
    make_product(owner, name="Linen Blazer", brand="Zara", price=4299)
    make_product(owner, name="Graphic Tee", brand="Roadster", price=499, tags=["streetwear"])

    def names(**params):
        response = client.get(f"{API}/products", params=params)
        assert response.status_code == 200, response.text
        return [p["name"] for p in response.json()]

    assert names(q="black cargo") == ["Black Cargo Pants"]
    assert names(q="streetwear") == ["Graphic Tee"]
    assert names(q="%") == []
    assert names(brand="roadster", sort="price_asc") == ["Graphic Tee", "Black Cargo Pants"]
    assert names(min_price=500, max_price=2000) == ["Black Cargo Pants"]
    assert client.get(f"{API}/products/brands").json() == ["Roadster", "Zara"]
    page = client.get(f"{API}/products", params={"limit": 1})
    assert page.headers["x-total-count"] == "3" and len(page.json()) == 1
    assert client.get(f"{API}/products", params={"sort": "distance"}).status_code == 422
    near = client.get(
        f"{API}/products", params={"lat": 12.97, "lng": 77.6, "radius_km": 5, "sort": "distance"}
    ).json()
    assert len(near) == 3 and near[0]["distance_km"] is not None

    bands = client.get(f"{API}/collections/price").json()
    assert [(b["label"], b["count"]) for b in bands] == [
        ("Under ₹500", 1),
        ("₹1,000 – ₹1,999", 1),
        ("₹2,000 – ₹4,999", 1),
    ]
    assert isinstance(bands[0]["products"][0]["price"], float)


def test_item_type_and_combinations(client, make_owner, make_product):
    owner = make_owner()
    shirt = make_product(owner, name="Pink Linen Shirt", colors=[{"name": "Pink"}])
    jeans = make_product(owner, name="Blue Denim Jeans", colors=[{"name": "Blue"}])
    make_product(owner, name="Red Trousers", colors=[{"name": "Yellow"}])
    make_product(owner, name="White Sneakers", colors=[{"name": "White"}])
    make_product(owner, name="Cotton Shirt")
    assert (shirt["item_type"], jeans["item_type"]) == ("top", "bottom")
    suggested = client.get(f"{API}/products/{shirt['id']}/combinations").json()
    names = [p["name"] for p in suggested]
    assert "Blue Denim Jeans" in names and "White Sneakers" in names
    assert "Cotton Shirt" not in names and "Red Trousers" not in names


def test_other_stores_cannot_touch_products(client, make_owner, make_product):
    owner = make_owner()
    rival = make_owner(email="rival@example.com", name="Rival")
    product = make_product(owner, sku="A1")
    url = f"{API}/shops/mine/products/{product['id']}"
    assert client.patch(url, json={"price": 1}, headers=bearer(rival)).status_code == 404
    assert client.delete(url, headers=bearer(rival)).status_code == 404
    assert client.get(f"{API}/products/{product['id']}").json()["price"] == 799
    # The same SKU is fine in a different store, but not twice in one.
    make_product(rival, sku="A1")
    again = client.post(
        f"{API}/shops/mine/products",
        json={"name": "Copy", "price": 10, "sku": "A1"},
        headers=bearer(owner),
    )
    assert again.status_code == 409

    assert client.patch(url, json={"price": 699}, headers=bearer(owner)).json()["price"] == 699
    assert client.patch(url, json={"price": None}, headers=bearer(owner)).status_code == 422
    assert (
        client.patch(url, json={"shop_id": product["id"]}, headers=bearer(owner)).status_code == 422
    )
    assert client.delete(url, headers=bearer(owner)).status_code == 204


def test_wishlist_and_missing_items(client, make_owner, make_product, make_shopper):
    product = make_product(make_owner())
    headers = bearer(make_shopper())
    url = f"{API}/me/wishlist/{product['id']}"
    assert client.put(url, headers=headers).status_code == 204
    assert client.put(url, headers=headers).status_code == 204
    assert len(client.get(f"{API}/me/wishlist", headers=headers).json()) == 1
    assert client.delete(url, headers=headers).status_code == 204
    assert client.get(f"{API}/me/wishlist", headers=headers).json() == []
    missing = "00000000-0000-0000-0000-00000000dead"
    assert client.get(f"{API}/products/{missing}").status_code == 404
    assert client.put(f"{API}/me/wishlist/{missing}", headers=headers).status_code == 404


def test_saved_looks_and_notifications(client, make_shopper):
    from app.db import new_session
    from app.models import Notification, Outfit

    shopper = make_shopper()
    other = bearer(make_shopper(email="other@example.com"))
    headers = bearer(shopper)
    with new_session() as db:
        look = Outfit(title="Weekend")
        note = Notification(user_id=shopper["user"]["id"], title="Hi", body="New in store")
        db.add_all([look, note])
        db.commit()
    url = f"{API}/me/saved-outfits/{look.id}"
    client.put(url, headers=headers)
    client.put(url, headers=headers)
    assert client.get(f"{API}/outfits").json()[0]["saved_count"] == 1
    client.delete(url, headers=headers)
    client.delete(url, headers=headers)
    assert client.get(f"{API}/outfits").json()[0]["saved_count"] == 0

    read = f"{API}/me/notifications/{note.id}/read"
    assert client.patch(read, headers=other).status_code == 404
    assert client.get(f"{API}/me/notifications", headers=other).json() == []
    assert client.patch(read, headers=headers).status_code == 204
    assert client.get(f"{API}/me/notifications", headers=headers).json()[0]["is_read"] is True
