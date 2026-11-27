"""Password hashing and tokens."""

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import Argon2Error, InvalidHashError

from app.core.config import get_settings

_hasher = PasswordHasher()
# Verified against when an email is unknown, so both failures take similar time.
_DUMMY_HASH = _hasher.hash(secrets.token_urlsafe(16))
_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    try:
        _hasher.verify(password_hash or _DUMMY_HASH, password)
    except (Argon2Error, InvalidHashError):
        return False
    return password_hash is not None


def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(UTC)
    claims = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=get_settings().access_token_minutes),
    }
    return jwt.encode(claims, get_settings().jwt_secret, algorithm=_ALGORITHM)


def read_access_token(token: str) -> uuid.UUID | None:
    try:
        claims = jwt.decode(
            token,
            get_settings().jwt_secret,
            algorithms=[_ALGORITHM],
            options={"require": ["sub", "exp"]},
        )
        if claims.get("type") != "access":
            return None
        return uuid.UUID(claims["sub"])
    except (jwt.PyJWTError, ValueError):
        return None


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
