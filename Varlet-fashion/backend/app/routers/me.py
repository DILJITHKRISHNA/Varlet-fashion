"""Everything that belongs to the signed-in shopper."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import current_user
from app.models import Notification, Outfit, OutfitSave, Product, Shop, ShopFollow, User, Wishlist
from app.schemas import NotificationOut, OutfitOut, ProductOut, ShopOut
from app.services.serialize import product_count_column, product_out, shop_out

router = APIRouter(prefix="/me", tags=["me"])


def no_content() -> Response:
    return Response(status_code=204)


def _add(db: Session, model, values: dict) -> bool:
    """Inserts a link row; False when it already existed."""
    statement = insert(model).values(**values).on_conflict_do_nothing().returning(model.user_id)
    return db.execute(statement).first() is not None


@router.get("/wishlist", response_model=list[ProductOut])
def wishlist(user: User = Depends(current_user), db: Session = Depends(get_db)):
    products = db.scalars(
        select(Product)
        .join(Wishlist, Wishlist.product_id == Product.id)
        .where(Wishlist.user_id == user.id)
        .order_by(Wishlist.created_at.desc())
    )
    return [product_out(p) for p in products]


@router.put("/wishlist/{product_id}", status_code=204)
def add_to_wishlist(
    product_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)
):
    if db.get(Product, product_id) is None:
        raise HTTPException(404, "Product not found.")
    _add(db, Wishlist, {"user_id": user.id, "product_id": product_id})
    db.commit()
    return no_content()


@router.delete("/wishlist/{product_id}", status_code=204)
def remove_from_wishlist(
    product_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)
):
    db.execute(
        delete(Wishlist).where(Wishlist.user_id == user.id, Wishlist.product_id == product_id)
    )
    db.commit()
    return no_content()


@router.get("/following", response_model=list[ShopOut])
def following(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Shop, product_count_column())
        .join(ShopFollow, ShopFollow.shop_id == Shop.id)
        .where(ShopFollow.user_id == user.id)
        .order_by(ShopFollow.created_at.desc())
    ).all()
    return [shop_out(shop, count) for shop, count in rows]


@router.put("/following/{shop_id}", status_code=204)
def follow(shop_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if db.get(Shop, shop_id) is None:
        raise HTTPException(404, "Store not found.")
    if _add(db, ShopFollow, {"user_id": user.id, "shop_id": shop_id}):
        db.execute(
            update(Shop).where(Shop.id == shop_id).values(follower_count=Shop.follower_count + 1)
        )
    db.commit()
    return no_content()


@router.delete("/following/{shop_id}", status_code=204)
def unfollow(shop_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)):
    removed = db.execute(
        delete(ShopFollow).where(ShopFollow.user_id == user.id, ShopFollow.shop_id == shop_id)
    ).rowcount
    if removed:
        db.execute(
            update(Shop)
            .where(Shop.id == shop_id)
            .values(follower_count=func.greatest(Shop.follower_count - 1, 0))
        )
    db.commit()
    return no_content()


@router.get("/saved-outfits", response_model=list[OutfitOut])
def saved_outfits(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(Outfit)
        .join(OutfitSave, OutfitSave.outfit_id == Outfit.id)
        .where(OutfitSave.user_id == user.id)
        .order_by(OutfitSave.created_at.desc())
    ).all()


@router.put("/saved-outfits/{outfit_id}", status_code=204)
def save_outfit(
    outfit_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)
):
    if db.get(Outfit, outfit_id) is None:
        raise HTTPException(404, "Look not found.")
    if _add(db, OutfitSave, {"user_id": user.id, "outfit_id": outfit_id}):
        db.execute(
            update(Outfit).where(Outfit.id == outfit_id).values(saved_count=Outfit.saved_count + 1)
        )
    db.commit()
    return no_content()


@router.delete("/saved-outfits/{outfit_id}", status_code=204)
def unsave_outfit(
    outfit_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)
):
    removed = db.execute(
        delete(OutfitSave).where(OutfitSave.user_id == user.id, OutfitSave.outfit_id == outfit_id)
    ).rowcount
    if removed:
        db.execute(
            update(Outfit)
            .where(Outfit.id == outfit_id)
            .values(saved_count=func.greatest(Outfit.saved_count - 1, 0))
        )
    db.commit()
    return no_content()


@router.get("/notifications", response_model=list[NotificationOut])
def notifications(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(100)
    ).all()


@router.patch("/notifications/{notification_id}/read", status_code=204)
def mark_read(
    notification_id: uuid.UUID, user: User = Depends(current_user), db: Session = Depends(get_db)
):
    changed = db.execute(
        update(Notification)
        .where(Notification.id == notification_id, Notification.user_id == user.id)
        .values(is_read=True)
    ).rowcount
    if not changed:
        raise HTTPException(404, "Notification not found.")
    db.commit()
    return no_content()
