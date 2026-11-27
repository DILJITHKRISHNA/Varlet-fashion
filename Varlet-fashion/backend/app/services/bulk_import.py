"""Product upload from a CSV or Excel file. Good rows are saved; bad rows are explained."""

import csv
import io
import re
import zipfile
from decimal import Decimal, InvalidOperation

from openpyxl import load_workbook
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product, Shop
from app.schemas import BulkError, BulkResult, ProductIn
from app.services.attributes import infer_item_type

MAX_BYTES = 5 * 1024 * 1024
MAX_UNPACKED_BYTES = 50 * 1024 * 1024
MAX_ROWS = 1000

COLUMNS = (
    "sku",
    "name",
    "price",
    "original_price",
    "brand",
    "category",
    "item_type",
    "sizes",
    "colors",
    "images",
    "description",
    "tags",
    "occasion",
    "fit",
    "gender",
    "in_stock",
)
TEMPLATE = (
    ",".join(COLUMNS) + "\n"
    "TEE-001,Oversized Graphic Tee,799,1299,Urban Thread Co.,Streetwear,top,S|M|L|XL,"
    "Black:#1F2937|White:#F9FAFB,https://example.com/photo.jpg,Soft cotton tee,"
    "oversized|casual,Casual,Oversized,unisex,yes\n"
)

_HEADER_ALIASES = {
    "product_name": "name",
    "title": "name",
    "mrp": "original_price",
    "selling_price": "price",
    "colour": "colors",
    "color": "colors",
    "colours": "colors",
    "size": "sizes",
    "image": "images",
    "image_url": "images",
    "image_urls": "images",
    "stock": "in_stock",
    "type": "item_type",
}
_YES = {"yes", "y", "true", "1", "in stock", "available"}
_NO = {"no", "n", "false", "0", "out of stock", "sold out"}


class FileProblem(ValueError):
    """The file as a whole cannot be used."""


def _header(value: object) -> str:
    key = re.sub(r"[^a-z]+", "_", str(value or "").strip().lower()).strip("_")
    return _HEADER_ALIASES.get(key, key)


def _cell(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def _read_table(filename: str, content: bytes) -> list[list[str]]:
    name = filename.lower()
    if name.endswith(".xlsx"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                if sum(i.file_size for i in archive.infolist()) > MAX_UNPACKED_BYTES:
                    raise FileProblem("That Excel file is too large once opened.")
            book = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            rows = []
            for row in book.worksheets[0].iter_rows(values_only=True):
                rows.append([_cell(v) for v in row])
                if len(rows) > MAX_ROWS + 50:
                    break
            return rows
        except FileProblem:
            raise
        except Exception as error:
            raise FileProblem("That Excel file could not be opened.") from error
    if name.endswith(".csv"):
        for encoding in ("utf-8-sig", "cp1252"):
            try:
                text = content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        else:
            raise FileProblem("Save the CSV file as UTF-8 and try again.")
        try:
            return [[_cell(v) for v in row] for row in csv.reader(io.StringIO(text))]
        except csv.Error as error:
            raise FileProblem("That CSV file could not be read.") from error
    raise FileProblem("Upload a .csv or .xlsx file.")


def _split(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[|;\n]", value) if part.strip()]


def _list(value: str) -> list[str]:
    # Commas also separate short lists such as sizes, but never URLs.
    return [part.strip() for part in re.split(r"[|;,\n]", value) if part.strip()]


def _money(value: str, label: str) -> Decimal | None:
    if not value:
        return None
    cleaned = re.sub(r"(?i)rs\.?|inr|₹|,|\s", "", value)
    try:
        return Decimal(cleaned).quantize(Decimal("0.01"))
    except InvalidOperation as error:
        raise ValueError(f"{label} '{value}' is not a number") from error


def _parse_row(row: dict[str, str]) -> dict:
    """Only columns with a value are returned, so a re-upload never blanks other fields."""
    data: dict = {}
    for key in ("sku", "name", "brand", "category", "description", "occasion", "fit"):
        if row.get(key):
            data[key] = row[key]
    if row.get("item_type"):
        data["item_type"] = row["item_type"].lower()
    price = _money(row.get("price", ""), "Price")
    if price is None:
        raise ValueError("Price is required")
    data["price"] = price
    original = _money(row.get("original_price", ""), "Original price")
    if original is not None:
        data["original_price"] = original
    if row.get("sizes"):
        data["sizes"] = _list(row["sizes"])
    if row.get("tags"):
        data["tags"] = [t.lower() for t in _list(row["tags"])]
    if row.get("images"):
        data["images"] = _split(row["images"])
    if row.get("colors"):
        colors = []
        for entry in _list(row["colors"]):
            name, _, code = entry.partition(":")
            colors.append({"name": name.strip(), "hex": code.strip() or None})
        data["colors"] = colors
    if row.get("gender"):
        data["gender"] = row["gender"].lower()
    if row.get("in_stock"):
        flag = row["in_stock"].lower()
        if flag not in _YES | _NO:
            raise ValueError("in_stock must be yes or no")
        data["in_stock"] = flag in _YES
    return data


def _explain(error: ValidationError) -> str:
    first = error.errors()[0]
    field = ".".join(str(p) for p in first["loc"])
    return f"{field}: {first['msg']}" if field else first["msg"]


def run_import(
    db: Session, shop: Shop, filename: str, content: bytes, *, dry_run: bool
) -> BulkResult:
    table = _read_table(filename, content)
    if not table:
        raise FileProblem("The file is empty.")
    headers = [_header(h) for h in table[0]]
    missing = [c for c in ("name", "price") if c not in headers]
    if missing:
        raise FileProblem(f"The first row must contain the columns: {', '.join(missing)}.")
    rows = [
        (number, dict(zip(headers, cells, strict=False)))
        for number, cells in enumerate(table[1:], start=2)
        if any(cells)
    ]
    if not rows:
        raise FileProblem("There are no products under the header row.")
    if len(rows) > MAX_ROWS:
        raise FileProblem(f"Upload at most {MAX_ROWS} products at a time.")

    skus = [r["sku"] for _, r in rows if r.get("sku")]
    existing = {
        p.sku: p
        for p in db.scalars(
            select(Product).where(Product.shop_id == shop.id, Product.sku.in_(skus))
        )
    }

    errors: list[BulkError] = []
    seen: set[str] = set()
    created = updated = 0
    for number, row in rows:
        try:
            data = _parse_row(row)
            sku = data.get("sku")
            if sku and sku in seen:
                raise ValueError(f"SKU {sku} appears more than once in this file")
            product = existing.get(sku) if sku else None
            valid = ProductIn.model_validate(data)
        except ValidationError as error:
            errors.append(BulkError(row=number, message=_explain(error)))
            continue
        except ValueError as error:
            errors.append(BulkError(row=number, message=str(error)))
            continue
        if sku:
            seen.add(sku)

        # New products get every default; updates only touch the columns provided.
        values = valid.model_dump() if product is None else valid.model_dump(include=set(data))
        if product is None:
            values["item_type"] = valid.item_type or infer_item_type(valid.name, valid.category)
            created += 1
            if not dry_run:
                db.add(Product(shop_id=shop.id, **values))
        else:
            updated += 1
            if not dry_run:
                for field, value in values.items():
                    setattr(product, field, value)

    if not dry_run:
        db.commit()
    return BulkResult(
        dry_run=dry_run, total_rows=len(rows), created=created, updated=updated, errors=errors
    )
