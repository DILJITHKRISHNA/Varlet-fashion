"""Ranks shop products against what was seen in the picture.

This compares attributes (type, colour, brand, words), not pixels, so "exact" is
only used when brand, type, colour and wording all agree.
"""

import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import DetectedItem
from app.services.attributes import color_families, infer_item_type

MIN_SCORE = 45
_STOP = {"the", "and", "with", "for", "men", "women", "unisex", "style", "fit", "piece"}


def _words(*texts: str) -> set[str]:
    words = set()
    for text in texts:
        for word in re.findall(r"[a-z0-9]+", text.lower().replace("t-shirt", "tee")):
            if len(word) > 2 and word not in _STOP:
                words.add(word.removesuffix("s") if len(word) > 3 else word)
    return words


def _normal(text: str | None) -> str:
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def score(item: DetectedItem, product: Product) -> tuple[int, bool]:
    """Returns (score, is_exact). A score of 0 means "do not show"."""
    item_type = item.item_type or infer_item_type(item.name)
    product_type = product.item_type or infer_item_type(product.name, product.category)
    brand = bool(item.brand) and _normal(item.brand) == _normal(product.brand)
    same_type = item_type is not None and item_type == product_type
    if item_type and product_type and not same_type:
        return 0, False
    if item.gender in ("men", "women") and product.gender not in (item.gender, "unisex"):
        return 0, False

    seen = _words(item.name, *item.keywords)
    have = _words(product.name, product.description, " ".join(product.tags), product.fit or "")
    shared = len(seen & have)
    same_color = bool(
        color_families(item.colors[:2])
        & color_families([c.get("name", "") for c in product.colors] + [product.name])
    )

    total = (40 if same_type else 0) + min(shared * 8, 32)
    total += (18 if same_color else 0) + (30 if brand else 0)
    exact = brand and same_type and same_color and shared >= 2
    return (min(total, 100) if total >= MIN_SCORE else 0), exact


def find_matches(
    db: Session, items: list[DetectedItem], filters: list, limit: int = 20
) -> list[tuple[bool, int, int, Product]]:
    """Returns (is_exact, score, detected_index, product), best first, one entry per product."""
    products = db.scalars(
        select(Product)
        .join(Product.shop)
        .where(Product.in_stock.is_(True), *filters)
        .order_by(Product.created_at.desc())
        .limit(2000)
    ).all()
    best: dict = {}
    for index, item in enumerate(items):
        for product in products:
            points, exact = score(item, product)
            if points and (product.id not in best or (exact, points) > best[product.id][:2]):
                best[product.id] = (exact, points, index, product)
    ranked = sorted(best.values(), key=lambda m: (not m[0], m[2], -m[1], m[3].price))
    return ranked[:limit]
