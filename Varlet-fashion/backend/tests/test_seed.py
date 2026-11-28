from sqlalchemy import func, select

from app import seed
from app.core.config import get_settings
from app.db import new_session
from app.models import Product, Shop, User


def counts():
    with new_session() as db:
        return tuple(db.scalar(select(func.count(m.id))) for m in (Shop, Product, User))


def test_sample_catalogue_is_opt_in(monkeypatch):
    monkeypatch.setattr(get_settings(), "load_sample_catalogue", False)
    assert seed.main(["--catalogue"]) == 0
    assert counts() == (0, 0, 0)


def test_sample_catalogue_fills_only_an_empty_database(monkeypatch):
    monkeypatch.setattr(get_settings(), "load_sample_catalogue", True)
    assert seed.main(["--catalogue"]) == 0
    assert counts() == (4, 6, 0)  # no accounts are ever created

    with new_session() as db:
        shop = db.scalar(select(Shop).where(Shop.name == "Urban Thread Co."))
        shop.name = "Renamed By Owner"
        db.commit()
    assert seed.main(["--catalogue"]) == 0
    with new_session() as db:
        assert db.scalar(select(Shop.id).where(Shop.name == "Renamed By Owner"))


def test_demo_accounts_are_refused_outside_development():
    assert seed.main([]) == 1  # tests run with ENVIRONMENT=test
    assert counts() == (0, 0, 0)
