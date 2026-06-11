from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api", tags=["protected"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: Annotated[User, Depends(get_current_user)]):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        role=current_user.role.name,
        created_at=current_user.created_at,
    )


@router.get("/admin/dashboard")
def admin_dashboard(
    _: Annotated[User, Depends(require_roles("admin"))],
):
    return {"message": "Admin area", "access": "granted"}


@router.get("/manager/dashboard")
def manager_dashboard(
    _: Annotated[User, Depends(require_roles("admin", "manager"))],
):
    return {"message": "Manager area", "access": "granted"}
