"""Distance in plain SQL (haversine), so any PostgreSQL works without PostGIS."""

import math

from sqlalchemy import ColumnElement, func

from app.models import Shop

EARTH_KM = 6371.0


def distance_km(lat: float, lng: float) -> ColumnElement[float]:
    half_dlat = func.sin(func.radians(Shop.lat - lat) / 2)
    half_dlng = func.sin(func.radians(Shop.lng - lng) / 2)
    a = func.pow(half_dlat, 2) + math.cos(math.radians(lat)) * func.cos(
        func.radians(Shop.lat)
    ) * func.pow(half_dlng, 2)
    # least() guards against rounding just past 1.
    return 2 * EARTH_KM * func.asin(func.least(1.0, func.sqrt(a)))


def within(lat: float, radius_km: float) -> ColumnElement[bool]:
    """Cheap latitude band that can use the index before the exact distance check."""
    degrees = radius_km / 111.0
    return Shop.lat.between(lat - degrees, lat + degrees)
