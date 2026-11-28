"""Settings come from the environment or backend/.env. Nothing secret has a default."""

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", extra="ignore")

    environment: str = "development"
    database_url: str
    jwt_secret: str = Field(min_length=32)
    access_token_minutes: int = 30
    refresh_token_days: int = 30
    cors_origins: str = "http://localhost:8080,http://localhost:8081"
    rate_limit_enabled: bool = True
    # Header in which the hosting proxy passes the visitor's address, if it does.
    # Only set it when a proxy you trust always overwrites that header.
    client_ip_header: str = ""
    # Fill a new, empty database with the sample shops (no accounts).
    load_sample_catalogue: bool = False
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"
    seed_password: str = ""

    @field_validator("database_url")
    @classmethod
    def use_psycopg_driver(cls, value: str) -> str:
        for prefix in ("postgresql://", "postgres://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix) :]
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
