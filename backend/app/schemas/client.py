from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ClientBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    comment: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    comment: str | None = None


class ClientResponse(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class ClientDeleteResponse(BaseModel):
    ok: bool
    id: int
    deleted_leads: int = 0
