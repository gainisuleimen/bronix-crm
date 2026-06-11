from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user_role import UserRole

DEFAULT_ROLES = ("admin", "manager")


def seed_roles(db: Session) -> None:
    for role_name in DEFAULT_ROLES:
        exists = db.scalar(select(UserRole).where(UserRole.name == role_name))
        if exists is None:
            db.add(UserRole(name=role_name))
    db.commit()
