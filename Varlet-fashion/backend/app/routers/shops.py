import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.ratelimit import rate_limit
from app.db import get_db
from app.deps import current_user
from app.models import Shop, User
from app.routers.auth import add_user, start_session
from app.schemas import ShopIn, ShopOut, ShopOwnerIn, ShopSessionOut
from app.services import geo
from app.services.serialize import product_count_column, shop_out

router = APIRouter(prefix="/shops", tags=["shops"])


def _attach_shop(db: Session, user: User, data: ShopIn) -> Shop:
    shop = Shop(**data.model_dump())
    db.add(shop)
    db.flush()
    user.shop_id = shop.id
    user.role = "admin"
    return shop


@router.post(
    "/register",
    response_model=ShopSessionOut,
    status_code=201,
    dependencies=[Depends(rate_limit("shop-register", 5))],
)
def register_owner_and_shop(body: ShopOwnerIn, db: Session = Depends(get_db)):
    """New owner account and store in one transaction: both are created, or neither."""
    owner = add_user(db, email=body.email, password=body.password, name=body.owner_name)
    shop = _attach_shop(db, owner, body.shop)
    session = start_session(db, owner)
    db.refresh(shop)
    return ShopSessionOut(**session.model_dump(), shop=shop_out(shop))


@router.post(
    "",
    response_model=ShopOut,
    status_code=201,
    dependencies=[Depends(rate_limit("shop-create", 5))],
)
def create_shop(body: ShopIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    """For someone already signed in who does not have a store yet."""
    # Lock the account row so two requests cannot create two stores.
    db.refresh(user, with_for_update=True)
    if user.shop_id is not None:
        raise HTTPException(409, "This account is already linked to a store.")
    if user.role != "consumer":
        raise HTTPException(403, "This account cannot register a store.")
    shop = _attach_shop(db, user, body)
    db.commit()
    db.refresh(shop)
    return shop_out(shop)


@router.get("", response_model=list[ShopOut])
def list_shops(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    rows = db.execute(
        select(Shop, product_count_column())
        .order_by(Shop.name, Shop.id)
        .limit(limit)
        .offset(offset)
    ).all()
    return [shop_out(shop, count) for shop, count in rows]


@router.get("/nearby", response_model=list[ShopOut])
def nearby_shops(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius_km: float = Query(10, gt=0, le=200),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    distance = geo.distance_km(lat, lng)
    rows = db.execute(
        select(Shop, product_count_column(), distance.label("distance"))
        .where(geo.within(lat, radius_km), distance <= radius_km)
        .order_by(distance)
        .limit(limit)
    ).all()
    return [shop_out(shop, count, km) for shop, count, km in rows]


@router.get("/{shop_id}", response_model=ShopOut)
def get_shop(shop_id: uuid.UUID, db: Session = Depends(get_db)):
    row = db.execute(select(Shop, product_count_column()).where(Shop.id == shop_id)).first()
    if row is None:
        raise HTTPException(404, "Store not found.")
    return shop_out(row[0], row[1])
