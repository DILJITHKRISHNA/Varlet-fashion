from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import read_access_token
from app.db import get_db
from app.models import SHOP_ROLES, Shop, User

_bearer = HTTPBearer(auto_error=False)


def optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    if credentials is None:
        return None
    user_id = read_access_token(credentials.credentials)
    user = db.get(User, user_id) if user_id else None
    return user if user and user.is_active else None


def current_user(user: User | None = Depends(optional_user)) -> User:
    if user is None:
        raise HTTPException(401, "Please sign in again.", headers={"WWW-Authenticate": "Bearer"})
    return user


def _shop_for(user: User, db: Session, roles: tuple[str, ...]) -> Shop:
    # The shop always comes from the signed-in account, never from the request.
    shop = db.get(Shop, user.shop_id) if user.shop_id else None
    if shop is None or user.role not in roles:
        raise HTTPException(403, "Your account cannot manage this store.")
    return shop


def staff_shop(user: User = Depends(current_user), db: Session = Depends(get_db)) -> Shop:
    """Any member of a shop: staff, manager or owner."""
    return _shop_for(user, db, SHOP_ROLES)


def manager_shop(user: User = Depends(current_user), db: Session = Depends(get_db)) -> Shop:
    """Owner or manager: store profile, offers and customer enquiries."""
    return _shop_for(user, db, ("manager", "admin"))
