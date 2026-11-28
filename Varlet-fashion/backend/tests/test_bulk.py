import io

from openpyxl import Workbook

from tests.conftest import bearer

URL = "/api/v1/shops/mine/products/bulk"


def upload(client, session, name, content, **params):
    return client.post(URL, files={"file": (name, content)}, params=params, headers=bearer(session))


def products(client, session):
    return client.get("/api/v1/shops/mine/products", headers=bearer(session)).json()


CSV = (
    "SKU,Name,Selling Price,MRP,Sizes,Colour,Image URL,Stock\n"
    'T1,Graphic Tee,"₹1,099",1299,"S, M, L",Black:#111111|White,https://example.com/a.jpg,yes\n'
    "T2,Cargo Pants,abc,,,,,\n"
    ",No Price,,,,,,\n"
    "T3,Bad Image,100,,,,ftp://example.com/x.jpg,\n"
    "T1,Duplicate,100,,,,,\n"
    "T4,Kurta,2199,,,,,no\n"
    ",,,,,,,\n"
)


def test_csv_preview_then_import_then_update(client, make_owner):
    owner = make_owner()
    preview = upload(client, owner, "stock.csv", CSV.encode(), dry_run=True).json()
    assert (preview["total_rows"], preview["created"]) == (6, 2)
    assert [e["row"] for e in preview["errors"]] == [3, 4, 5, 6]
    assert products(client, owner) == []

    result = upload(client, owner, "stock.csv", CSV.encode()).json()
    assert (result["created"], result["updated"]) == (2, 0)
    saved = {p["sku"]: p for p in products(client, owner)}
    assert saved["T1"]["price"] == 1099 and saved["T1"]["sizes"] == ["S", "M", "L"]
    assert saved["T1"]["colors"][0] == {"name": "Black", "hex": "#111111"}
    assert saved["T1"]["item_type"] == "top" and saved["T4"]["in_stock"] is False

    # A price-only re-upload keeps photos, sizes and colours.
    change = upload(client, owner, "p.csv", b"sku,name,price\nT1,Graphic Tee,899\n").json()
    assert (change["created"], change["updated"]) == (0, 1)
    tee = {p["sku"]: p for p in products(client, owner)}["T1"]
    assert tee["price"] == 899 and tee["images"] and tee["sizes"] == ["S", "M", "L"]


def test_excel_upload(client, make_owner):
    owner = make_owner()
    book = Workbook()
    book.active.append(["name", "price", "sku"])
    book.active.append(["Denim Jacket", 1899.0, 1001])
    buffer = io.BytesIO()
    book.save(buffer)
    result = upload(client, owner, "stock.xlsx", buffer.getvalue()).json()
    assert result["created"] == 1 and result["errors"] == []
    assert products(client, owner)[0]["sku"] == "1001"


def test_unusable_files_are_explained(client, make_owner):
    owner = make_owner()
    for name, content, code in (
        ("a.txt", b"name,price\nA,1", 422),
        ("a.xlsx", b"not a spreadsheet", 422),
        ("a.csv", b"title only\nx", 422),
        ("a.csv", b"name,price\n", 422),
        ("a.csv", b"name,price\n" + b"Tee,1\n" * 1001, 422),
        ("a.csv", b"x" * (5 * 1024 * 1024 + 1), 413),
    ):
        assert upload(client, owner, name, content).status_code == code, name


def test_template_imports_cleanly(client, make_owner):
    owner = make_owner()
    # Opened by the phone's browser, so it needs no sign-in.
    template = client.get("/api/v1/shops/mine/products/bulk-template.csv").content
    result = upload(client, owner, "t.csv", template).json()
    assert result["created"] == 1 and result["errors"] == []
