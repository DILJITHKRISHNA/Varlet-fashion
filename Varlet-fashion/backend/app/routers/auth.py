from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import get_settings
from app.core.ratelimit import rate_limit
from app.db import get_db
from app.deps import current_user
from app.models import RefreshToken, User
from app.schemas import LoginIn, ProfilePatch, RefreshIn, RegisterIn, SessionOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_TAKEN = "An account with this email already exists."


def start_session(db: Session, user: User) -> SessionOut:
    """Issues tokens and commits. Only a hash of the refresh token is stored."""
    refresh = security.new_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=security.hash_token(refresh),
            expires_at=datetime.now(UTC) + timedelta(days=get_settings().refresh_token_days),
        )
    )
    db.commit()
    db.refresh(user)
    return SessionOut(
        access_token=security.create_access_token(user.id),
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )


def add_user(db: Session, *, email: str, password: str, **fields) -> User:
    """Adds a user to the current transaction (flushed, not committed)."""
    email = email.strip().lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(409, EMAIL_TAKEN)
    user = User(email=email, password_hash=security.hash_password(password), **fields)
    db.add(user)
    try:
        db.flush()
    except IntegrityError as error:  # two sign-ups for one email at the same moment
        db.rollback()
        raise HTTPException(409, EMAIL_TAKEN) from error
    return user


@router.post(
    "/register",
    response_model=SessionOut,
    status_code=201,
    dependencies=[Depends(rate_limit("register", 5))],
)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    user = add_user(db, **body.model_dump())
    return start_session(db, user)


@router.post("/login", response_model=SessionOut, dependencies=[Depends(rate_limit("login", 10))])
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    valid = security.verify_password(body.password, user.password_hash if user else None)
    if not (user and valid and user.is_active):
        raise HTTPException(401, "Incorrect email or password.")
    return start_session(db, user)


@router.post(
    "/refresh", response_model=SessionOut, dependencies=[Depends(rate_limit("refresh", 30))]
)
def refresh(body: RefreshIn, db: Session = Depends(get_db)):
    expired = HTTPException(401, "Your session has ended. Please sign in again.")
    token = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == security.hash_token(body.refresh_token)
        )
    )
    if token is None:
        raise expired
    now = datetime.now(UTC)
    # Claim the token in one statement so it can only ever be exchanged once.
    claimed = db.execute(
        update(RefreshToken)
        .where(RefreshToken.id == token.id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
        .returning(RefreshToken.id)
    ).first()
    if claimed is None:
        # An already used token came back: assume it leaked and end every session.
        db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == token.user_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        db.commit()
        raise expired
    user = db.get(User, token.user_id)
    if token.expires_at <= now or user is None or not user.is_active:
        db.commit()
        raise expired
    return start_session(db, user)


@router.post("/logout", status_code=204)
def logout(body: RefreshIn, db: Session = Depends(get_db)):
    db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.token_hash == security.hash_token(body.refresh_token),
            RefreshToken.revoked_at.is_(None),
        )
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()
    return Response(status_code=204)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(
    body: ProfilePatch, user: User = Depends(current_user), db: Session = Depends(get_db)
):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
