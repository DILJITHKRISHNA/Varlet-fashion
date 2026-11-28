"""Shop owner tools. Every query is limited to the signed-in account's own store."""

import uuid
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.ratelimit import rate_limit
from app.db import get_db
from app.deps import manager_shop, staff_shop
from app.models import Enquiry, Offer, Product, Shop
from app.schemas import (
    BulkResult,
    EnquiryCounts,
    EnquiryDay,
    EnquiryOut,
    EnquiryProduct,
    EnquirySummary,
    OfferIn,
    OfferOut,
    OfferPatch,
    ProductIn,
    ProductOut,
    ProductPatch,
    ShopOut,
    ShopPatch,
)
from app.services import bulk_import
from app.services.attributes import infer_item_type
from app.services.offers import offer_out
from app.services.serialize import count_products, product_out, shop_out

router = APIRouter(prefix="/shops/mine", tags=["my store"])

# Days on the enquiry chart follow the shops' local calendar.
LOCAL_ZONE = "Asia/Kolkata"
DUPLICATE_SKU = "Another product in your store already uses this SKU."


@router.get("", response_model=ShopOut)
def my_shop(shop: Shop = Depends(staff_shop), db: Session = Depends(get_db)):
    return shop_out(shop, count_products(db, shop))


@router.patch("", response_model=ShopOut)
def update_my_shop(
    body: ShopPatch, shop: Shop = Depends(manager_shop), db: Session = Depends(get_db)
):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(shop, field, value)
    db.commit()
    db.refresh(shop)
    return shop_out(shop, count_products(db, shop))


# ─── Products ────────────────────────────────────────────────────────────


def _own_product(db: Session, shop: Shop, product_id: uuid.UUID) -> Product:
    product = db.get(Product, product_id)
    # Another shop's product looks the same as a missing one.
    if product is None or product.shop_id != shop.id:
        raise HTTPException(404, "Product not found.")
    return product


def _save(db: Session, product: Product) -> ProductOut:
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if "uq_products_shop_id_sku" in str(error.orig):
            raise HTTPException(409, DUPLICATE_SKU) from error
        raise
    db.refresh(product)
    return product_out(product)


@router.get("/products", response_model=list[ProductOut])
def my_products(shop: Shop = Depends(staff_shop), db: Session = Depends(get_db)):
    products = db.scalars(
        select(Product)
        .where(Product.shop_id == shop.id)
        .order_by(Product.created_at.desc(), Product.id)
    )
    return [product_out(p) for p in products]


@router.post("/products", response_model=ProductOut, status_code=201)
def add_product(body: ProductIn, shop: Shop = Depends(staff_shop), db: Session = Depends(get_db)):
    values = body.model_dump()
    values["sku"] = body.sku or None
    values["item_type"] = body.item_type or infer_item_type(body.name, body.category)
    product = Product(shop_id=shop.id, **values)
    db.add(product)
    return _save(db, product)


@router.get("/products/bulk-template.csv")
def bulk_template():
    """Public on purpose: a phone opens it in the browser, and it holds only column names."""
    return Response(
        bulk_import.TEMPLATE,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="varlet-products.csv"'},
    )


@router.post(
    "/products/bulk", 
    response_model=BulkResult,
    dependencies=[Depends(rate_limit("bulk", 10))],
)
def bulk_upload(
    file: UploadFile = File(),
    dry_run: bool = Query(False, description="Check the file without saving anything"),
    shop: Shop = Depends(staff_shop),
    db: Session = Depends(get_db),
):
    content = file.file.read(bulk_import.MAX_BYTES + 1)
    if len(content) > bulk_import.MAX_BYTES:
        raise HTTPException(413, "The file is larger than 5 MB.")
    try:
        return bulk_import.run_import(db, shop, file.filename or "", content, dry_run=dry_run)
    except bulk_import.FileProblem as error:
        raise HTTPException(422, str(error)) from error
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            409, "The products changed while uploading. Please try again."
        ) from error


@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: uuid.UUID,
    body: ProductPatch,
    shop: Shop = Depends(staff_shop),
    db: Session = Depends(get_db),
):
    product = _own_product(db, shop, product_id)
    values = body.model_dump(exclude_unset=True)
    if "sku" in values:
        values["sku"] = values["sku"] or None
    for field, value in values.items():
        setattr(product, field, value)
    return _save(db, product)


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: uuid.UUID, shop: Shop = Depends(staff_shop), db: Session = Depends(get_db)
):
    db.delete(_own_product(db, shop, product_id))
    db.commit()
    return Response(status_code=204)


# ─── Offers ──────────────────────────────────────────────────────────────


def _check_products(db: Session, shop: Shop, product_ids: list[uuid.UUID]) -> None:
    if not product_ids:
        return
    found = db.scalar(
        select(func.count(Product.id)).where(
            Product.shop_id == shop.id, Product.id.in_(product_ids)
        )
    )
    if found != len(set(product_ids)):
        raise HTTPException(422, "Offers can only include products from your own store.")


def _own_offer(db: Session, shop: Shop, offer_id: uuid.UUID) -> Offer:
    offer = db.get(Offer, offer_id)
    if offer is None or offer.shop_id != shop.id:
        raise HTTPException(404, "Offer not found.")
    return offer


@router.get("/offers", response_model=list[OfferOut])
def my_offers(shop: Shop = Depends(staff_shop), db: Session = Depends(get_db)):
    offers = db.scalars(
        select(Offer).where(Offer.shop_id == shop.id).order_by(Offer.created_at.desc())
    )
    return [offer_out(o) for o in offers]


@router.post("/offers", response_model=OfferOut, status_code=201)
def add_offer(body: OfferIn, shop: Shop = Depends(manager_shop), db: Session = Depends(get_db)):
    _check_products(db, shop, body.product_ids)
    values = body.model_dump()
    values["starts_at"] = body.starts_at or datetime.now(UTC)
    offer = Offer(shop_id=shop.id, **values)
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer_out(offer)


@router.patch("/offers/{offer_id}", response_model=OfferOut)
def update_offer(
    offer_id: uuid.UUID,
    body: OfferPatch,
    shop: Shop = Depends(manager_shop),
    db: Session = Depends(get_db),
):
    offer = _own_offer(db, shop, offer_id)
    values = body.model_dump(exclude_unset=True)
    _check_products(db, shop, values.get("product_ids", []))
    starts = values.get("starts_at", offer.starts_at)
    ends = values.get("ends_at", offer.ends_at)
    if ends is not None and ends <= starts:
        raise HTTPException(422, "The end date must be after the start date.")
    for field, value in values.items():
        setattr(offer, field, value)
    db.commit()
    db.refresh(offer)
    return offer_out(offer)


@router.delete("/offers/{offer_id}", status_code=204)
def delete_offer(
    offer_id: uuid.UUID, shop: Shop = Depends(manager_shop), db: Session = Depends(get_db)
):
    db.delete(_own_offer(db, shop, offer_id))
    db.commit()
    return Response(status_code=204)


# ─── Customer enquiries ──────────────────────────────────────────────────


@router.get("/enquiries/summary", response_model=EnquirySummary)
def enquiry_summary(
    days: int = Query(30, ge=1, le=365),
    shop: Shop = Depends(manager_shop),
    db: Session = Depends(get_db),
):
    zone = ZoneInfo(LOCAL_ZONE)
    first_day = datetime.now(zone).date() - timedelta(days=days - 1)
    since = datetime.combine(first_day, datetime.min.time(), tzinfo=zone)
    recent = (Enquiry.shop_id == shop.id, Enquiry.created_at >= since)

    day = func.date(func.timezone(LOCAL_ZONE, Enquiry.created_at))
    by_day = {
        first_day + timedelta(days=i): EnquiryDay(date=str(first_day + timedelta(days=i)))
        for i in range(days)
    }
    totals = EnquiryCounts()
    for date, kind, count in db.execute(
        select(day, Enquiry.kind, func.count()).where(*recent).group_by(day, Enquiry.kind)
    ):
        setattr(totals, kind, getattr(totals, kind) + count)
        if date in by_day:
            setattr(by_day[date], kind, count)

    top = db.execute(
        select(Product.id, Product.name, func.count().label("taps"))
        .join(Enquiry, Enquiry.product_id == Product.id)
        .where(*recent)
        .group_by(Product.id, Product.name)
        .order_by(func.count().desc(), Product.name)
        .limit(5)
    ).all()
    return EnquirySummary(
        days=days,
        total=totals.whatsapp + totals.call + totals.directions,
        totals=totals,
        by_day=list(by_day.values()),
        top_products=[EnquiryProduct(product_id=i, name=n, count=c) for i, n, c in top],
    )


@router.get("/enquiries", response_model=list[EnquiryOut])
def recent_enquiries(
    limit: int = Query(50, ge=1, le=200),
    shop: Shop = Depends(manager_shop),
    db: Session = Depends(get_db),
):
    rows = db.execute(
        select(Enquiry, Product.name)
        .outerjoin(Product, Product.id == Enquiry.product_id)
        .where(Enquiry.shop_id == shop.id)
        .order_by(Enquiry.created_at.desc())
        .limit(limit)
    ).all()
    return [
        EnquiryOut(
            id=e.id,
            kind=e.kind,
            product_id=e.product_id,
            product_name=product_name,
            created_at=e.created_at,
        )
        for e, product_name in rows
    ]
