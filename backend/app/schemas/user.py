from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    phone: str | None = None
    position: str | None = None
    photo_url: str | None = None
    is_active: bool
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamMemberResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None
    phone: str | None
    position: str | None
    photo_url: str | None
    role: str

    model_config = {"from_attributes": True}


class TeamMemberUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    position: str | None = Field(default=None, max_length=255)
    photo_url: str | None = Field(default=None, max_length=500)