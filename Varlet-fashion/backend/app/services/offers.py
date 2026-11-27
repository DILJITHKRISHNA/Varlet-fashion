from app.models import Offer
from app.schemas import OfferOut


def offer_out(offer: Offer, distance_km: float | None = None) -> OfferOut:
    data = {c.key: getattr(offer, c.key) for c in Offer.__table__.columns}
    return OfferOut(
        **data,
        shop_name=offer.shop.name,
        distance_km=None if distance_km is None else round(float(distance_km), 2),
    )
