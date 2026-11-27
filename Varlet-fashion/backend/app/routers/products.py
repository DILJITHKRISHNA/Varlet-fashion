import uuid
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Product, Shop
from app.schemas import Gender, ItemType, PriceBandOut, ProductOut
from app.services import combinations, geo
from app.services.serialize import product_out

router = APIRouter(tags=["products"])

PRICE_BANDS: list[tuple[str, int, int | None]] = [
    ("Under ₹500", 0, 500),
    ("₹500 – ₹999", 500, 1000),
    ("₹1,000 – ₹1,999", 1000, 2000),
    ("₹2,000 – ₹4,999", 2000, 5000),
    ("₹5,000 and above", 5000, None),
]


def like_pattern(text: str) -> str:
    """Treats %, _ and \\ typed by a user as ordinary characters."""
    escaped = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def apply_search(query: Select, text: str) -> Select:
    """Every word must appear somewhere in the product."""
    for word in text.split()[:8]:
        pattern = like_pattern(word)
        query = query.where(
            or_(
                *(
                    column.ilike(pattern, escape="\\")
                    for column in (Product.name, Product.brand, Product.category, Shop.name)
                ),
                func.array_to_string(Product.tags, " ").ilike(pattern, escape="\\"),
            )
        )
    return query


@router.get("/products", response_model=list[ProductOut])
def list_products(
    response: Response,
    db: Session = Depends(get_db),
    q: str | None = Query(None, max_length=100),
    category: str | None = None,
    brand: str | None = None,
    item_type: ItemType | None = None,
    shop_id: uuid.UUID | None = None,
    gender: Gender | None = None,
    min_price: Decimal | None = Query(None, ge=0),
    max_price: Decimal | None = Query(None, ge=0),
    trending: bool = False,
    in_stock: bool = False,
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
    radius_km: float | None = Query(None, gt=0, le=200),
    sort: Literal["newest", "price_asc", "price_desc", "distance"] = "newest",
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    located = lat is not None and lng is not None
    if (sort == "distance" or radius_km is not None) and not located:
        raise HTTPException(422, "lat and lng are needed to search by distance.")
    distance = geo.distance_km(lat, lng) if located else None

    columns = [Product] if distance is None else [Product, distance.label("distance")]
    query = select(*columns).join(Product.shop)
    if q:
        query = apply_search(query, q)
    if category:
        query = query.where(Product.category == category)
    if brand:
        query = query.where(func.lower(Product.brand) == brand.strip().lower())
    if item_type:
        query = query.where(Product.item_type == item_type)
    if shop_id:
        query = query.where(Product.shop_id == shop_id)
    if gender:
        query = query.where(Product.gender == gender)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    if trending:
        query = query.where(Product.is_trending.is_(True))
    if in_stock:
        query = query.where(Product.in_stock.is_(True))
    if radius_km is not None:
        query = query.where(geo.within(lat, radius_km), distance <= radius_km)

    total = db.scalar(
        select(func.count()).select_from(query.with_only_columns(Product.id).subquery())
    )
    response.headers["X-Total-Count"] = str(total or 0)

    order = {
        "newest": [Product.created_at.desc()],
        "price_asc": [Product.price.asc()],
        "price_desc": [Product.price.desc()],
        "distance": [distance] if distance is not None else [],
    }[sort]
    rows = db.execute(query.order_by(*order, Product.id).limit(limit).offset(offset)).all()
    return [product_out(*row) for row in rows]


@router.get("/products/brands", response_model=list[str])
def list_brands(db: Session = Depends(get_db)):
    brands = db.scalars(
        select(func.min(Product.brand))
        .where(Product.brand.is_not(None), Product.brand != "")
        .group_by(func.lower(Product.brand))
        .order_by(func.lower(Product.brand))
    )
    return list(brands)


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(404, "Product not found.")
    return product_out(product)


@router.get("/products/{product_id}/combinations", response_model=list[ProductOut])
def get_combinations(
    product_id: uuid.UUID, limit: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)
):
    """Pieces that go with this one, e.g. trousers and shoes for a shirt."""
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(404, "Product not found.")
    return [product_out(p) for p in combinations.suggest(db, product, limit)]


@router.get("/collections/price", response_model=list[PriceBandOut])
def price_collections(
    db: Session = Depends(get_db),
    gender: Gender | None = None,
    per_band: int = Query(8, ge=1, le=24),
):
    bands = []
    for label, low, high in PRICE_BANDS:
        conditions = [Product.price >= low, Product.in_stock.is_(True)]
        if high is not None:
            conditions.append(Product.price < high)
        if gender:
            conditions.append(Product.gender.in_([gender, "unisex"]))
        count = db.scalar(select(func.count(Product.id)).where(*conditions)) or 0
        if not count:
            continue
        products = db.scalars(
            select(Product)
            .where(*conditions)
            .order_by(Product.is_trending.desc(), Product.created_at.desc(), Product.id)
            .limit(per_band)
        )
        bands.append(
            PriceBandOut(
                label=label,
                min_price=low,
                max_price=high,
                count=count,
                products=[product_out(p) for p in products],
            )
        )
    return bands
