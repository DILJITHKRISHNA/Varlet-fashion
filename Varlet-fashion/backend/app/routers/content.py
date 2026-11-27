import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.ratelimit import rate_limit
from app.db import get_db
from app.deps import optional_user
from app.models import Banner, Category, Enquiry, Offer, Outfit, Product, Shop, User
from app.schemas import BannerOut, CategoryOut, EnquiryIn, OfferOut, OutfitOut
from app.services import geo
from app.services.offers import offer_out

router = APIRouter(tags=["discovery"])


@router.get("/categories", response_model=list[CategoryOut])
def categories(db: Session = Depends(get_db)):
    count = (
        select(func.count(Product.id))
        .where(Product.category == Category.name)
        .correlate(Category)
        .scalar_subquery()
    )
    rows = db.execute(select(Category, count).order_by(Category.sort_order, Category.name)).all()
    return [
        CategoryOut.model_validate(category).model_copy(update={"product_count": total})
        for category, total in rows
    ]


@router.get("/banners", response_model=list[BannerOut])
def banners(db: Session = Depends(get_db)):
    return db.scalars(
        select(Banner).where(Banner.is_active.is_(True)).order_by(Banner.sort_order)
    ).all()


@router.get("/outfits", response_model=list[OutfitOut])
def outfits(db: Session = Depends(get_db), limit: int = Query(100, ge=1, le=200)):
    return db.scalars(
        select(Outfit).order_by(Outfit.saved_count.desc(), Outfit.id).limit(limit)
    ).all()


@router.get("/offers", response_model=list[OfferOut])
def offers(
    db: Session = Depends(get_db),
    shop_id: uuid.UUID | None = None,
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
    radius_km: float = Query(25, gt=0, le=200),
    limit: int = Query(50, ge=1, le=100),
):
    """Offers running right now, nearest first when a location is given."""
    now = datetime.now(UTC)
    distance = geo.distance_km(lat, lng) if lat is not None and lng is not None else None
    columns = [Offer] if distance is None else [Offer, distance.label("distance")]
    query = (
        select(*columns)
        .join(Offer.shop)
        .where(
            Offer.is_active.is_(True),
            Offer.starts_at <= now,
            or_(Offer.ends_at.is_(None), Offer.ends_at > now),
        )
    )
    if shop_id:
        query = query.where(Offer.shop_id == shop_id)
    if distance is not None:
        if not shop_id:
            query = query.where(geo.within(lat, radius_km), distance <= radius_km)
        query = query.order_by(distance, Offer.created_at.desc())
    else:
        query = query.order_by(Offer.created_at.desc())
    return [offer_out(*row) for row in db.execute(query.limit(limit)).all()]


@router.post("/enquiries", status_code=201, dependencies=[Depends(rate_limit("enquiry", 30))])
def record_enquiry(
    body: EnquiryIn,
    user: User | None = Depends(optional_user),
    db: Session = Depends(get_db),
):
    """Counts a tap on WhatsApp, call or directions for the shop's dashboard."""
    if db.get(Shop, body.shop_id) is None:
        raise HTTPException(404, "Store not found.")
    if body.product_id is not None:
        product = db.get(Product, body.product_id)
        if product is None or product.shop_id != body.shop_id:
            raise HTTPException(422, "That product does not belong to this store.")
    db.add(Enquiry(**body.model_dump(), user_id=user.id if user else None))
    db.commit()
    return {"recorded": True}
