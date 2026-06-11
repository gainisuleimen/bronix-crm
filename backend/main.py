from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.clients import router as clients_router
from app.api.leads import router as leads_router
from app.api.health import router as health_router
from app.api.protected import router as protected_router
from app.api.team import router as team_router
from app.core.config import settings
from app.db.migrate import run_migrations
from app.db.seed import seed_roles
from app.middleware.jwt_auth import JWTAuthMiddleware
from app.models import Client, Lead, User, UserRole  # noqa: F401
from database import Base, SessionLocal, engine

UPLOADS_DIR = Path(__file__).parent / "uploads"
AVATARS_DIR = UPLOADS_DIR / "avatars"
AVATARS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    AVATARS_DIR.mkdir(parents=True, exist_ok=True)
    db = SessionLocal()
    try:
        seed_roles(db)
    finally:
        db.close()
    yield


app = FastAPI(title="CRM Diplom API", lifespan=lifespan)

app.add_middleware(JWTAuthMiddleware)

_cors_kwargs: dict = {
    "allow_origins": settings.cors_origins,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
    "expose_headers": ["*"],
}
if not settings.is_production:
    _cors_kwargs["allow_origin_regex"] = (
        r"https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$"
    )

app.add_middleware(CORSMiddleware, **_cors_kwargs)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(clients_router)
app.include_router(leads_router)
app.include_router(team_router)
app.include_router(analytics_router)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
