import logging

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db import get_db
from app.routers import auth, content, manage, me, products, search, shops

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


def create_app() -> FastAPI:
    settings = get_settings()
    production = settings.environment == "production"
    app = FastAPI(
        title="Varlet API",
        version="1.0.0",
        docs_url=None if production else "/docs",
        redoc_url=None,
        openapi_url=None if production else "/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["X-Total-Count"],
    )

    @app.get("/health", tags=["health"])
    def health(db: Session = Depends(get_db)):
        db.execute(text("select 1"))
        return {"status": "ok"}

    api = APIRouter(prefix="/api/v1")
    # `manage` comes before `shops` so /shops/mine is not read as a shop id.
    for module in (auth, manage, shops, products, content, me, search):
        api.include_router(module.router)
    app.include_router(api)
    return app


app = create_app()
