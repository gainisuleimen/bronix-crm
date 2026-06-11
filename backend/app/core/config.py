from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Render/Railway отдают postgres:// или postgresql:// — приводим к psycopg2."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/crm_diplom"
    jwt_secret: str = "change_me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24
    frontend_url: str = "http://localhost:5173"
    environment: str = "development"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_db_url(cls, value: str) -> str:
        if isinstance(value, str):
            return normalize_database_url(value)
        return value

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origins(self) -> list[str]:
        origins = [origin.strip() for origin in self.frontend_url.split(",") if origin.strip()]
        if not self.is_production:
            for dev_origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
                if dev_origin not in origins:
                    origins.append(dev_origin)
        return origins

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.is_production and self.jwt_secret in ("change_me", "change_me_in_real_env"):
            raise ValueError("JWT_SECRET must be set to a strong random value in production")
        return self


settings = Settings()
