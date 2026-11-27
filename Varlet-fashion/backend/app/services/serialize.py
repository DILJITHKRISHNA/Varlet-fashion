"""Builds response objects that need data from more than one table."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Product, Shop
from app.schemas import ProductOut, ShopOut


def product_out(product: Product, distance_km: float | None = None) -> ProductOut:
    data = {c.key: getattr(product, c.key) for c in Product.__table__.columns}
    return ProductOut(**data, shop_name=product.shop.name, distance_km=_round(distance_km))


def shop_out(shop: Shop, product_count: int = 0, distance_km: float | None = None) -> ShopOut:
    data = {c.key: getattr(shop, c.key) for c in Shop.__table__.columns}
    return ShopOut(**data, product_count=product_count, distance_km=_round(distance_km))


def product_count_column():
    return (
        select(func.count(Product.id))
        .where(Product.shop_id == Shop.id)
        .correlate(Shop)
        .scalar_subquery()
    )


def count_products(db: Session, shop: Shop) -> int:
    return db.scalar(select(func.count(Product.id)).where(Product.shop_id == shop.id)) or 0


def _round(distance: float | None) -> float | None:
    return None if distance is None else round(float(distance), 2)
