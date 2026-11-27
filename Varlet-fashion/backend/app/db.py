from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


@lru_cache
def get_engine() -> Engine:
    # prepare_threshold=None keeps transaction-pooled connections (e.g. PgBouncer) working.
    return create_engine(
        get_settings().database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
        connect_args={"prepare_threshold": None},
    )


@lru_cache
def _factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False)


def get_db() -> Iterator[Session]:
    with _factory()() as session:
        yield session


def new_session() -> Session:
    return _factory()()
