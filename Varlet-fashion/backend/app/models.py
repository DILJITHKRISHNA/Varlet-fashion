"""All tables live in the `varlet` schema, which Supabase's public REST API does not expose."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    MetaData,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

SCHEMA = "varlet"

ROLES = ("consumer", "staff", "manager", "admin", "super_admin")  # "admin" = shop owner
SHOP_ROLES = ("staff", "manager", "admin")
GENDERS = ("men", "women", "unisex")
ITEM_TYPES = ("top", "bottom", "outerwear", "dress", "ethnic", "footwear", "accessory")
ENQUIRY_KINDS = ("whatsapp", "call", "directions")


def _one_of(column: str, values: tuple[str, ...]) -> str:
    return f"{column} in ({', '.join(repr(v) for v in values)})"


class Base(DeclarativeBase):
    metadata = MetaData(
        schema=SCHEMA,
        naming_convention={
            "ix": "ix_%(table_name)s_%(column_0_N_name)s",
            "uq": "uq_%(table_name)s_%(column_0_N_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s",
            "pk": "pk_%(table_name)s",
        },
    )
    type_annotation_map = {
        uuid.UUID: UUID(as_uuid=True),
        datetime: DateTime(timezone=True),
        str: Text,
        list[str]: ARRAY(Text),
    }


def _id() -> Mapped[uuid.UUID]:
    return mapped_column(
        primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )


def _created() -> Mapped[datetime]:
    return mapped_column(server_default=func.now())


def _list() -> Mapped[list[str]]:
    return mapped_column(default=list, server_default=text("'{}'"))


def _fk(target: str, ondelete: str, **kwargs):
    return mapped_column(ForeignKey(f"{SCHEMA}.{target}", ondelete=ondelete), **kwargs)


class Shop(Base):
    __tablename__ = "shops"
    __table_args__ = (Index(None, "lat", "lng"),)

    id: Mapped[uuid.UUID] = _id()
    name: Mapped[str]
    description: Mapped[str] = mapped_column(default="", server_default="")
    logo_url: Mapped[str | None]
    cover_image_url: Mapped[str | None]
    category: Mapped[str | None]
    location_text: Mapped[str]
    lat: Mapped[float]
    lng: Mapped[float]
    phone: Mapped[str | None]
    whatsapp: Mapped[str | None]
    rating: Mapped[Decimal] = mapped_column(Numeric(2, 1), default=0, server_default="0")
    review_count: Mapped[int] = mapped_column(default=0, server_default="0")
    follower_count: Mapped[int] = mapped_column(default=0, server_default="0")
    is_verified: Mapped[bool] = mapped_column(default=False, server_default=text("false"))
    is_open: Mapped[bool] = mapped_column(default=True, server_default=text("true"))
    created_at: Mapped[datetime] = _created()


class User(Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint(_one_of("role", ROLES), name="role"),)

    id: Mapped[uuid.UUID] = _id()
    name: Mapped[str]
    email: Mapped[str] = mapped_column(String(320), unique=True)
    password_hash: Mapped[str]
    mobile: Mapped[str | None]
    avatar_url: Mapped[str | None]
    gender: Mapped[str | None]
    age_group: Mapped[str | None]
    fashion_preferences: Mapped[list[str]] = _list()
    location_text: Mapped[str | None]
    role: Mapped[str] = mapped_column(default="consumer", server_default="consumer")
    shop_id: Mapped[uuid.UUID | None] = _fk("shops.id", "SET NULL", index=True)
    is_active: Mapped[bool] = mapped_column(default=True, server_default=text("true"))
    created_at: Mapped[datetime] = _created()


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = _id()
    user_id: Mapped[uuid.UUID] = _fk("users.id", "CASCADE", index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = _created()


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="price"),
        CheckConstraint(_one_of("gender", GENDERS), name="gender"),
        CheckConstraint(_one_of("item_type", ITEM_TYPES), name="item_type"),
        Index(
            "uq_products_shop_id_sku",
            "shop_id",
            "sku",
            unique=True,
            postgresql_where=text("sku IS NOT NULL"),
        ),
        Index(None, "price"),
    )

    id: Mapped[uuid.UUID] = _id()
    shop_id: Mapped[uuid.UUID] = _fk("shops.id", "CASCADE", index=True)
    sku: Mapped[str | None]
    name: Mapped[str]
    brand: Mapped[str | None]
    category: Mapped[str | None] = mapped_column(index=True)
    item_type: Mapped[str | None]
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    images: Mapped[list[str]] = _list()
    description: Mapped[str] = mapped_column(default="", server_default="")
    sizes: Mapped[list[str]] = _list()
    colors: Mapped[list] = mapped_column(JSONB, default=list, server_default=text("'[]'"))
    in_stock: Mapped[bool] = mapped_column(default=True, server_default=text("true"))
    rating: Mapped[Decimal] = mapped_column(Numeric(2, 1), default=0, server_default="0")
    review_count: Mapped[int] = mapped_column(default=0, server_default="0")
    tags: Mapped[list[str]] = _list()
    occasion: Mapped[str | None]
    fit: Mapped[str | None]
    gender: Mapped[str] = mapped_column(default="unisex", server_default="unisex")
    is_trending: Mapped[bool] = mapped_column(default=False, server_default=text("false"))
    is_new: Mapped[bool] = mapped_column(default=False, server_default=text("false"))
    created_at: Mapped[datetime] = _created()

    shop: Mapped[Shop] = relationship(lazy="joined")


class Offer(Base):
    __tablename__ = "offers"
    __table_args__ = (
        CheckConstraint("discount_percent between 1 and 90", name="discount"),
        CheckConstraint("ends_at is null or ends_at > starts_at", name="dates"),
    )

    id: Mapped[uuid.UUID] = _id()
    shop_id: Mapped[uuid.UUID] = _fk("shops.id", "CASCADE", index=True)
    title: Mapped[str]
    description: Mapped[str] = mapped_column(default="", server_default="")
    discount_percent: Mapped[int | None]
    product_ids: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, server_default=text("'{}'")
    )
    starts_at: Mapped[datetime] = _created()
    ends_at: Mapped[datetime | None]
    is_active: Mapped[bool] = mapped_column(default=True, server_default=text("true"))
    created_at: Mapped[datetime] = _created()

    shop: Mapped[Shop] = relationship(lazy="joined")


class Enquiry(Base):
    """One tap on WhatsApp, call or directions."""

    __tablename__ = "enquiries"
    __table_args__ = (
        CheckConstraint(_one_of("kind", ENQUIRY_KINDS), name="kind"),
        Index(None, "shop_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = _id()
    shop_id: Mapped[uuid.UUID] = _fk("shops.id", "CASCADE")
    product_id: Mapped[uuid.UUID | None] = _fk("products.id", "SET NULL")
    user_id: Mapped[uuid.UUID | None] = _fk("users.id", "SET NULL")
    kind: Mapped[str]
    created_at: Mapped[datetime] = _created()


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = _id()
    name: Mapped[str] = mapped_column(unique=True)
    icon: Mapped[str] = mapped_column(default="", server_default="")
    color: Mapped[str] = mapped_column(default="#000000", server_default="#000000")
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")


class Outfit(Base):
    __tablename__ = "outfits"

    id: Mapped[uuid.UUID] = _id()
    shop_id: Mapped[uuid.UUID | None] = _fk("shops.id", "SET NULL")
    title: Mapped[str]
    image_url: Mapped[str | None]
    style: Mapped[str | None]
    tags: Mapped[list[str]] = _list()
    product_ids: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, server_default=text("'{}'")
    )
    saved_count: Mapped[int] = mapped_column(default=0, server_default="0")
    created_at: Mapped[datetime] = _created()


class Banner(Base):
    __tablename__ = "banners"

    id: Mapped[uuid.UUID] = _id()
    title: Mapped[str]
    subtitle: Mapped[str | None]
    image_url: Mapped[str | None]
    type: Mapped[str] = mapped_column(default="homepage", server_default="homepage")
    cta_text: Mapped[str | None]
    cta_route: Mapped[str | None]
    background_color: Mapped[str] = mapped_column(default="#000000", server_default="#000000")
    is_active: Mapped[bool] = mapped_column(default=True, server_default=text("true"))
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = _id()
    user_id: Mapped[uuid.UUID] = _fk("users.id", "CASCADE", index=True)
    title: Mapped[str]
    body: Mapped[str]
    type: Mapped[str] = mapped_column(default="system", server_default="system")
    is_read: Mapped[bool] = mapped_column(default=False, server_default=text("false"))
    image_url: Mapped[str | None]
    created_at: Mapped[datetime] = _created()


class Wishlist(Base):
    __tablename__ = "wishlists"

    user_id: Mapped[uuid.UUID] = _fk("users.id", "CASCADE", primary_key=True)
    product_id: Mapped[uuid.UUID] = _fk("products.id", "CASCADE", primary_key=True)
    created_at: Mapped[datetime] = _created()


class ShopFollow(Base):
    __tablename__ = "shop_follows"

    user_id: Mapped[uuid.UUID] = _fk("users.id", "CASCADE", primary_key=True)
    shop_id: Mapped[uuid.UUID] = _fk("shops.id", "CASCADE", primary_key=True)
    created_at: Mapped[datetime] = _created()


class OutfitSave(Base):
    __tablename__ = "outfit_saves"

    user_id: Mapped[uuid.UUID] = _fk("users.id", "CASCADE", primary_key=True)
    outfit_id: Mapped[uuid.UUID] = _fk("outfits.id", "CASCADE", primary_key=True)
    created_at: Mapped[datetime] = _created()
