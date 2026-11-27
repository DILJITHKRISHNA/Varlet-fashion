"""Request and response shapes. Responses use snake_case; clients map to their own style."""

import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated, ClassVar, Literal

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    PlainSerializer,
    StringConstraints,
    field_validator,
    model_validator,
)

Gender = Literal["men", "women", "unisex"]
ItemType = Literal["top", "bottom", "outerwear", "dress", "ethnic", "footwear", "accessory"]
EnquiryKind = Literal["whatsapp", "call", "directions"]

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]
Short = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120)]
LongText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^\+?[0-9 ()-]{7,20}$")]
Password = Annotated[str, StringConstraints(min_length=8, max_length=128)]
WebUrl = Annotated[str, StringConstraints(max_length=1000, pattern=r"^https?://\S+$")]
TagList = Annotated[list[Short], Field(max_length=30)]
# JSON numbers rather than strings, so clients can use prices directly.
Money = Annotated[Decimal, PlainSerializer(float, return_type=float, when_used="json")]
Price = Annotated[Decimal, Field(ge=0, le=Decimal("10000000"), max_digits=10, decimal_places=2)]


class Input(BaseModel):
    """Unknown fields are rejected, so nobody can slip in `role` or `shop_id`."""

    model_config = ConfigDict(extra="forbid")


class Patch(Input):
    """Partial update: a field may be left out, but a required column cannot be set to null."""

    NULLABLE: ClassVar[tuple[str, ...]] = ()

    @model_validator(mode="after")
    def no_nulls_for_required(self):
        allowed = type(self).NULLABLE
        for field in self.model_fields_set:
            if getattr(self, field) is None and field not in allowed:
                raise ValueError(f"{field} cannot be empty")
        return self


class Output(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ─── Users and auth ──────────────────────────────────────────────────────


class RegisterIn(Input):
    name: Name
    email: EmailStr
    password: Password
    mobile: Phone | None = None
    gender: Short | None = None
    age_group: Short | None = None
    fashion_preferences: TagList = []


class LoginIn(Input):
    email: EmailStr
    password: Annotated[str, StringConstraints(max_length=128)]


class RefreshIn(Input):
    refresh_token: Annotated[str, StringConstraints(min_length=10, max_length=200)]


class ProfilePatch(Patch):
    NULLABLE: ClassVar = ("mobile", "avatar_url", "gender", "age_group", "location_text")
    name: Name | None = None
    mobile: Phone | None = None
    avatar_url: WebUrl | None = None
    gender: Short | None = None
    age_group: Short | None = None
    location_text: Short | None = None
    fashion_preferences: TagList | None = None


class UserOut(Output):
    id: uuid.UUID
    name: str
    email: str
    mobile: str | None
    avatar_url: str | None
    gender: str | None
    age_group: str | None
    fashion_preferences: list[str]
    location_text: str | None
    role: str
    shop_id: uuid.UUID | None
    created_at: datetime


class SessionOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"  # noqa: S105 - an HTTP auth scheme, not a secret
    user: UserOut


# ─── Shops ───────────────────────────────────────────────────────────────


class ShopIn(Input):
    name: Name
    description: LongText = ""
    category: Short | None = None
    location_text: Name
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    phone: Phone | None = None
    whatsapp: Phone | None = None


class ShopPatch(Patch):
    NULLABLE: ClassVar = ("category", "phone", "whatsapp", "logo_url", "cover_image_url")
    name: Name | None = None
    description: LongText | None = None
    category: Short | None = None
    location_text: Name | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    phone: Phone | None = None
    whatsapp: Phone | None = None
    logo_url: WebUrl | None = None
    cover_image_url: WebUrl | None = None
    is_open: bool | None = None


class ShopOwnerIn(Input):
    owner_name: Name
    email: EmailStr
    password: Password
    shop: ShopIn


class ShopOut(Output):
    id: uuid.UUID
    name: str
    description: str
    logo_url: str | None
    cover_image_url: str | None
    category: str | None
    location_text: str
    lat: float
    lng: float
    phone: str | None
    whatsapp: str | None
    rating: Money
    review_count: int
    follower_count: int
    is_verified: bool
    is_open: bool
    product_count: int = 0
    distance_km: float | None = None


class ShopSessionOut(SessionOut):
    shop: ShopOut


# ─── Products ────────────────────────────────────────────────────────────


class Color(Input):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]
    hex: Annotated[str, StringConstraints(pattern=r"^#[0-9a-fA-F]{6}$")] | None = None


class ProductIn(Input):
    sku: Short | None = None
    name: Name
    brand: Short | None = None
    category: Short | None = None
    item_type: ItemType | None = None
    price: Price
    original_price: Price | None = None
    images: Annotated[list[WebUrl], Field(max_length=10)] = []
    description: LongText = ""
    sizes: TagList = []
    colors: Annotated[list[Color], Field(max_length=20)] = []
    in_stock: bool = True
    tags: TagList = []
    occasion: Short | None = None
    fit: Short | None = None
    gender: Gender = "unisex"
    is_new: bool = False


class ProductPatch(Patch):
    NULLABLE: ClassVar = (
        "sku",
        "brand",
        "category",
        "item_type",
        "original_price",
        "occasion",
        "fit",
    )
    sku: Short | None = None
    name: Name | None = None
    brand: Short | None = None
    category: Short | None = None
    item_type: ItemType | None = None
    price: Price | None = None
    original_price: Price | None = None
    images: Annotated[list[WebUrl], Field(max_length=10)] | None = None
    description: LongText | None = None
    sizes: TagList | None = None
    colors: Annotated[list[Color], Field(max_length=20)] | None = None
    in_stock: bool | None = None
    tags: TagList | None = None
    occasion: Short | None = None
    fit: Short | None = None
    gender: Gender | None = None
    is_new: bool | None = None


class ProductOut(Output):
    id: uuid.UUID
    shop_id: uuid.UUID
    shop_name: str
    sku: str | None
    name: str
    brand: str | None
    category: str | None
    item_type: str | None
    price: Money
    original_price: Money | None
    images: list[str]
    description: str
    sizes: list[str]
    colors: list[dict]
    in_stock: bool
    rating: Money
    review_count: int
    tags: list[str]
    occasion: str | None
    fit: str | None
    gender: str
    is_trending: bool
    is_new: bool
    created_at: datetime
    distance_km: float | None = None


class PriceBandOut(BaseModel):
    label: str
    min_price: float
    max_price: float | None
    count: int
    products: list[ProductOut]


class BulkError(BaseModel):
    row: int
    message: str


class BulkResult(BaseModel):
    dry_run: bool
    total_rows: int
    created: int
    updated: int
    errors: list[BulkError]


# ─── Offers and enquiries ────────────────────────────────────────────────


class OfferIn(Input):
    title: Name
    description: LongText = ""
    discount_percent: int | None = Field(default=None, ge=1, le=90)
    product_ids: Annotated[list[uuid.UUID], Field(max_length=100)] = []
    starts_at: AwareDatetime | None = None
    ends_at: AwareDatetime | None = None
    is_active: bool = True

    @field_validator("ends_at")
    @classmethod
    def ends_in_future(cls, value):
        if value is not None and value <= datetime.now(UTC):
            raise ValueError("The end date must be in the future")
        return value

    @model_validator(mode="after")
    def ordered(self):
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("The end date must be after the start date")
        return self


class OfferPatch(Patch):
    NULLABLE: ClassVar = ("discount_percent", "ends_at")
    title: Name | None = None
    description: LongText | None = None
    discount_percent: int | None = Field(default=None, ge=1, le=90)
    product_ids: Annotated[list[uuid.UUID], Field(max_length=100)] | None = None
    starts_at: AwareDatetime | None = None
    ends_at: AwareDatetime | None = None
    is_active: bool | None = None


class OfferOut(Output):
    id: uuid.UUID
    shop_id: uuid.UUID
    shop_name: str
    title: str
    description: str
    discount_percent: int | None
    product_ids: list[uuid.UUID]
    starts_at: datetime
    ends_at: datetime | None
    is_active: bool
    distance_km: float | None = None


class EnquiryIn(Input):
    shop_id: uuid.UUID
    kind: EnquiryKind
    product_id: uuid.UUID | None = None


class EnquiryCounts(BaseModel):
    whatsapp: int = 0
    call: int = 0
    directions: int = 0


class EnquiryDay(EnquiryCounts):
    date: str


class EnquiryProduct(BaseModel):
    product_id: uuid.UUID
    name: str
    count: int


class EnquirySummary(BaseModel):
    days: int
    total: int
    totals: EnquiryCounts
    by_day: list[EnquiryDay]
    top_products: list[EnquiryProduct]


class EnquiryOut(BaseModel):
    id: uuid.UUID
    kind: str
    product_id: uuid.UUID | None
    product_name: str | None
    created_at: datetime


# ─── Content ─────────────────────────────────────────────────────────────


class CategoryOut(Output):
    id: uuid.UUID
    name: str
    icon: str
    color: str
    product_count: int = 0


class BannerOut(Output):
    id: uuid.UUID
    title: str
    subtitle: str | None
    image_url: str | None
    type: str
    cta_text: str | None
    cta_route: str | None
    background_color: str


class OutfitOut(Output):
    id: uuid.UUID
    shop_id: uuid.UUID | None
    title: str
    image_url: str | None
    style: str | None
    tags: list[str]
    product_ids: list[uuid.UUID]
    saved_count: int


class NotificationOut(Output):
    id: uuid.UUID
    title: str
    body: str
    type: str
    is_read: bool
    image_url: str | None
    created_at: datetime


# ─── Image search ────────────────────────────────────────────────────────


class DetectedItem(BaseModel):
    item_type: str | None = None
    name: str = ""
    brand: str | None = None
    colors: list[str] = []
    keywords: list[str] = []
    gender: str | None = None


class Match(BaseModel):
    match: Literal["exact", "similar"]
    score: int
    detected_index: int
    product: ProductOut


class ImageSearchOut(BaseModel):
    detected: list[DetectedItem]
    results: list[Match]
