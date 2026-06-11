from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

LeadStatus = Literal["new", "in_progress", "completed", "cancelled"]
LeadSortField = Literal["created_at", "scheduled_date", "deadline_at"]
LeadSortOrder = Literal["asc", "desc"]

LEAD_STATUSES: tuple[LeadStatus, ...] = (
    "new",
    "in_progress",
    "completed",
    "cancelled",
)


class LeadBase(BaseModel):
    client_id: int
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: LeadStatus = "new"
    assigned_to_id: int | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    deadline_at: datetime | None = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    client_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: LeadStatus | None = None
    assigned_to_id: int | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    deadline_at: datetime | None = None


class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_name: str
    assigned_to_name: str | None = None
    created_at: datetime
