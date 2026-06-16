from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from database import get_db

router = APIRouter(tags=["health"])


@router.get("/")
def root():
    return {
        "name": "Bronix CRM API",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
        "frontend": settings.frontend_url,
        "hint": "Это backend API. Откройте frontend по ссылке выше.",
    }


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
