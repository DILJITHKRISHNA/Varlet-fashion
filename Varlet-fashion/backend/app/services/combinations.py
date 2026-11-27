"""Rule-based outfit pairing: complementary garment types in colours that work together."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product
from app.services.attributes import color_families

_PARTNERS = {
    "top": ("bottom", "footwear", "outerwear", "accessory"),
    "bottom": ("top", "footwear", "outerwear", "accessory"),
    "outerwear": ("top", "bottom", "footwear"),
    "dress": ("footwear", "outerwear", "accessory"),
    "ethnic": ("footwear", "accessory", "bottom"),
    "footwear": ("bottom", "top", "dress"),
    "accessory": ("top", "dress", "bottom"),
}
_NEUTRALS = {"black", "white", "grey", "beige", "blue", "brown"}
_PAIRS = {
    frozenset(p)
    for p in (
        ("pink", "green"),
        ("orange", "green"),
        ("yellow", "purple"),
        ("red", "pink"),
        ("yellow", "orange"),
        ("purple", "pink"),
    )
}


def _color_score(base: set[str], other: set[str]) -> int:
    if not base or not other:
        return 1
    if any(frozenset((a, b)) in _PAIRS for a in base for b in other):
        return 3
    if other & _NEUTRALS:
        return 3 if base - _NEUTRALS else 2
    if base & _NEUTRALS:
        return 2
    return 0


def _colors(product: Product) -> set[str]:
    return color_families([c.get("name", "") for c in product.colors])


def suggest(db: Session, product: Product, limit: int) -> list[Product]:
    partners = _PARTNERS.get(product.item_type or "")
    if not partners:
        return []
    query = select(Product).where(
        Product.id != product.id,
        Product.item_type.in_(partners),
        Product.in_stock.is_(True),
    )
    if product.gender != "unisex":
        query = query.where(Product.gender.in_([product.gender, "unisex"]))
    candidates = db.scalars(query.order_by(Product.created_at.desc()).limit(300)).all()

    base = _colors(product)
    ranked = sorted(
        ((_color_score(base, _colors(c)), c) for c in candidates),
        key=lambda pair: (
            -pair[0],
            pair[1].shop_id != product.shop_id,  # same shop first: one visit
            partners.index(pair[1].item_type),
        ),
    )
    # At most two of each type, so the answer reads like an outfit.
    chosen: list[Product] = []
    used: dict[str, int] = {}
    for score, candidate in ranked:
        if score and used.get(candidate.item_type, 0) < 2:
            chosen.append(candidate)
            used[candidate.item_type] = used.get(candidate.item_type, 0) + 1
        if len(chosen) == limit:
            break
    return chosen
