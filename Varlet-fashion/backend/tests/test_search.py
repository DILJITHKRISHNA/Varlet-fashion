import json

import httpx

from app.schemas import DetectedItem
from app.services import vision

URL = "/api/v1/search/image"
JPEG = b"\xff\xd8\xff\xe0" + b"0" * 64
MP4 = b"\x00\x00\x00\x18ftypmp42" + b"0" * 64


def search(client, content, **params):
    return client.post(URL, files={"file": ("shot.bin", content)}, params=params)


def test_reports_when_not_configured(client):
    response = search(client, JPEG)
    assert response.status_code == 503
    assert "not set up" in response.json()["detail"]


def test_rejects_wrong_and_oversized_files(client):
    assert search(client, b"%PDF-1.4 not a picture").status_code == 415
    assert search(client, JPEG + b"0" * (8 * 1024 * 1024)).status_code == 413


def test_matches_are_ranked_and_labelled(client, make_owner, make_product, monkeypatch):
    owner = make_owner()
    make_product(
        owner,
        name="Oversized Graphic Tee",
        brand="Roadster",
        price=799,
        colors=[{"name": "Black"}],
        tags=["oversized", "graphic"],
    )
    make_product(owner, name="Plain White Tee", price=399, colors=[{"name": "White"}])
    make_product(owner, name="Black Cargo Pants", price=1499, colors=[{"name": "Black"}])
    seen = DetectedItem(
        item_type="top",
        name="oversized graphic t-shirt",
        brand="roadster",
        colors=["black"],
        keywords=["oversized", "graphic"],
    )
    monkeypatch.setattr(vision, "detect_items", lambda content, mime: [seen])

    body = search(client, MP4).json()
    results = [(r["product"]["name"], r["match"]) for r in body["results"]]
    assert results[0] == ("Oversized Graphic Tee", "exact")
    assert ("Plain White Tee", "similar") in results
    assert all(name != "Black Cargo Pants" for name, _ in results)

    assert search(client, JPEG, brand="Zara").json()["results"] == []
    cheap = search(client, JPEG, max_price=500).json()["results"]
    assert [r["product"]["name"] for r in cheap] == ["Plain White Tee"]


def test_reads_gemini_reply_and_keeps_key_out_of_url(monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "gemini_api_key", "test-key")
    sent = {}

    def fake_post(url, **kwargs):
        sent.update(url=url, **kwargs)
        items = [
            {"item_type": "spaceship", "name": "x" * 500, "colors": ["red"]},
            {"colors": "not a list"},
        ]
        text = json.dumps({"items": items})
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": text}]}}]})

    monkeypatch.setattr(httpx, "post", fake_post)
    items = vision.detect_items(JPEG, "image/jpeg")
    assert len(items) == 1 and items[0].item_type is None and len(items[0].name) == 120
    assert "test-key" not in sent["url"] and sent["headers"]["x-goog-api-key"] == "test-key"


def test_gemini_errors_become_safe_messages(client, monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setattr(get_settings(), "gemini_api_key", "test-key")
    for upstream, expected in ((429, 429), (400, 502), (500, 502)):
        monkeypatch.setattr(
            httpx, "post", lambda *a, code=upstream, **k: httpx.Response(code, text="secret detail")
        )
        response = client.post(URL, files={"file": ("a.jpg", JPEG)})
        assert response.status_code == expected
        assert "secret" not in response.text
