from decimal import Decimal

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.ratelimit import rate_limit
from app.db import get_db
from app.models import Product
from app.schemas import ImageSearchOut, Match
from app.services import matching, vision
from app.services.serialize import product_out

router = APIRouter(prefix="/search", tags=["visual search"])

# Inline requests to Gemini are limited in size, and base64 adds a third.
MAX_IMAGE = 8 * 1024 * 1024
MAX_VIDEO = 12 * 1024 * 1024


def sniff(content: bytes) -> str | None:
    """Identifies the file from its first bytes; the client's label is not trusted."""
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"
    if content[4:8] == b"ftyp":
        brand = content[8:12]
        if brand in (b"heic", b"heix", b"mif1", b"heif"):
            return "image/heic"
        return "video/quicktime" if brand == b"qt  " else "video/mp4"
    if content.startswith(b"\x1a\x45\xdf\xa3"):
        return "video/webm"
    return None


@router.post(
    "/image",
    response_model=ImageSearchOut,
    dependencies=[Depends(rate_limit("image-search", 8))],
)
def search_by_image(
    file: UploadFile = File(description="Screenshot, photo, or a short reel/post video"),
    brand: str | None = Query(None, max_length=60),
    max_price: Decimal | None = Query(None, ge=0),
    db: Session = Depends(get_db),
):
    content = file.file.read(MAX_VIDEO + 1)
    mime = sniff(content)
    if mime is None:
        raise HTTPException(
            415, "Upload a JPG, PNG, WEBP or HEIC picture, or an MP4/MOV/WEBM clip."
        )
    limit = MAX_VIDEO if mime.startswith("video/") else MAX_IMAGE
    if len(content) > limit:
        raise HTTPException(413, f"That file is larger than {limit // 1024 // 1024} MB.")
    try:
        detected = vision.detect_items(content, mime)
    except vision.VisionUnavailable as error:
        raise HTTPException(error.status, str(error)) from error

    filters = []
    if brand:
        filters.append(func.lower(Product.brand) == brand.strip().lower())
    if max_price is not None:
        filters.append(Product.price <= max_price)
    matches = matching.find_matches(db, detected, filters) if detected else []
    return ImageSearchOut(
        detected=detected,
        results=[
            Match(
                match="exact" if exact else "similar",
                score=points,
                detected_index=index,
                product=product_out(product),
            )
            for exact, points, index, product in matches
        ],
    )
