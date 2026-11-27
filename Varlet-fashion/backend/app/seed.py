"""Loads sample shops, products and demo accounts for local development.

    python -m app.seed

Safe to run again: sample rows are replaced, everything else is left alone.
"""

import json
import sys
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.engine import make_url

from app.core.config import get_settings
from app.core.security import hash_password
from app.db import new_session
from app.models import Banner, Category, Outfit, Product, Shop, User
from app.services.attributes import infer_item_type

DATA = Path(__file__).parent / "data" / "seed.json"
DEMO_SHOP = "00000000-0000-0000-0000-000000000001"
DEMO_USERS = (
    ("consumer@varlet.dev", "Aanya Sharma", "consumer", None),
    ("owner@varlet.dev", "Rohan Mehta", "admin", DEMO_SHOP),
    ("manager@varlet.dev", "Priya Nair", "manager", DEMO_SHOP),
    ("admin@varlet.dev", "Varlet Platform Admin", "super_admin", None),
)


def main() -> int:
    settings = get_settings()
    host = make_url(settings.database_url).host
    if settings.environment != "development" or host not in ("127.0.0.1", "localhost"):
        print("Refusing to load demo accounts outside a local development database.")
        return 1
    if len(settings.seed_password) < 8:
        print("Set SEED_PASSWORD (8+ characters) in backend/.env first.")
        return 1

    data = json.loads(DATA.read_text())
    with new_session() as db:
        for row in data["categories"]:
            existing = db.scalar(select(Category).where(Category.name == row["name"]))
            db.merge(Category(**({"id": existing.id} if existing else {}), **row))
        for row in data["shops"]:
            db.merge(Shop(**row))
        db.flush()
        for row in data["products"]:
            item_type = infer_item_type(row["name"], row["category"])
            db.merge(Product(**row, item_type=item_type))
        for row in data["outfits"]:
            db.merge(Outfit(**row))
        for row in data["banners"]:
            db.merge(Banner(**row))
        for email, name, role, shop_id in DEMO_USERS:
            user = db.scalar(select(User).where(User.email == email))
            if user is None:
                user = User(email=email)
                db.add(user)
            user.name, user.role, user.shop_id = name, role, shop_id
            user.password_hash = hash_password(settings.seed_password)
        db.commit()
        print(
            f"Loaded {db.scalar(select(func.count(Shop.id)))} shops, "
            f"{db.scalar(select(func.count(Product.id)))} products."
        )
    print("Demo accounts:", ", ".join(u[0] for u in DEMO_USERS))
    print("Their password is SEED_PASSWORD in backend/.env.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
