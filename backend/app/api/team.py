import base64
from io import BytesIO
from pathlib import Path
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from PIL import Image
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import TeamMemberResponse, TeamMemberUpdate
from database import get_db

router = APIRouter(prefix="/api/team", tags=["team"])

UPLOADS_ROOT = Path(__file__).resolve().parents[2] / "uploads" / "avatars"
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_PHOTO_SIZE = 5 * 1024 * 1024
MAX_STORED_PHOTO_BYTES = 180_000


def _user_to_team_member(user: User) -> TeamMemberResponse:
    return TeamMemberResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        position=user.position,
        photo_url=user.photo_url,
        role=user.role.name,
    )


def _can_edit_member(current_user: User, target_user: User) -> bool:
    return current_user.id == target_user.id or current_user.role.name == "admin"


def _get_editable_user(
    user_id: int,
    current_user: User,
    db: Session,
) -> User:
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not _can_edit_member(current_user, user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own profile",
        )
    return user


def _remove_local_photo(photo_url: str | None) -> None:
    if not photo_url or not photo_url.startswith("/uploads/avatars/"):
        return

    file_path = UPLOADS_ROOT / Path(photo_url).name
    if file_path.is_file():
        file_path.unlink(missing_ok=True)


def _encode_avatar_data_uri(content: bytes) -> str:
    image = Image.open(BytesIO(content))
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    image.thumbnail((400, 400), Image.Resampling.LANCZOS)

    quality = 85
    compressed = b""
    while quality >= 50:
        buffer = BytesIO()
        image.save(buffer, format="JPEG", quality=quality, optimize=True)
        compressed = buffer.getvalue()
        if len(compressed) <= MAX_STORED_PHOTO_BYTES:
            break
        quality -= 10

    encoded = base64.b64encode(compressed).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


@router.get("", response_model=list[TeamMemberResponse])
def list_team_members(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None, min_length=1, max_length=255),
):
    query = (
        select(User)
        .where(User.is_active.is_(True))
        .order_by(User.full_name.asc().nulls_last(), User.email.asc())
    )

    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
                User.phone.ilike(pattern),
                User.position.ilike(pattern),
            )
        )

    users = list(db.scalars(query).all())
    return [_user_to_team_member(user) for user in users]


@router.put("/{user_id}", response_model=TeamMemberResponse)
def update_team_member(
    user_id: int,
    payload: TeamMemberUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user = _get_editable_user(user_id, current_user, db)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return _user_to_team_member(user)


@router.post("/{user_id}/photo", response_model=TeamMemberResponse)
async def upload_team_member_photo(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: UploadFile = File(...),
):
    user = _get_editable_user(user_id, current_user, db)

    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supported formats: JPEG, PNG, WebP, GIF",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    if len(content) > MAX_PHOTO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photo must be 5 MB or smaller",
        )

    try:
        photo_data_uri = _encode_avatar_data_uri(content)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image file",
        ) from exc

    _remove_local_photo(user.photo_url)
    user.photo_url = photo_data_uri

    db.commit()
    db.refresh(user)
    return _user_to_team_member(user)


@router.delete("/{user_id}/photo", response_model=TeamMemberResponse)
def delete_team_member_photo(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    user = _get_editable_user(user_id, current_user, db)

    _remove_local_photo(user.photo_url)
    user.photo_url = None

    db.commit()
    db.refresh(user)
    return _user_to_team_member(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team_member(
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can remove team members",
        )

    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own account",
        )

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    _remove_local_photo(user.photo_url)
    db.delete(user)
    db.commit()
