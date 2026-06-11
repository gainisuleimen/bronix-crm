from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.models.client import Client
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import (
    LEAD_STATUSES,
    LeadCreate,
    LeadResponse,
    LeadSortField,
    LeadSortOrder,
    LeadUpdate,
)
from database import get_db

router = APIRouter(prefix="/api/leads", tags=["leads"])


def _assignee_name(user: User | None) -> str | None:
    if user is None:
        return None
    return user.full_name or user.email


def _lead_to_response(lead: Lead) -> LeadResponse:
    return LeadResponse(
        id=lead.id,
        client_id=lead.client_id,
        client_name=lead.client.full_name,
        title=lead.title,
        description=lead.description,
        status=lead.status,
        assigned_to_id=lead.assigned_to_id,
        assigned_to_name=_assignee_name(lead.assigned_to),
        scheduled_date=lead.scheduled_date,
        scheduled_time=lead.scheduled_time,
        deadline_at=lead.deadline_at,
        created_at=lead.created_at,
    )


def _get_lead_or_404(db: Session, lead_id: int) -> Lead:
    lead = db.scalar(
        select(Lead)
        .options(joinedload(Lead.client), joinedload(Lead.assigned_to))
        .where(Lead.id == lead_id)
    )
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


def _ensure_client_exists(db: Session, client_id: int) -> None:
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Client not found")


def _ensure_assignee_exists(db: Session, user_id: int) -> None:
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignee not found",
        )


def _apply_sort(query, sort_by: LeadSortField, sort_order: LeadSortOrder):
    column_map = {
        "created_at": Lead.created_at,
        "scheduled_date": Lead.scheduled_date,
        "deadline_at": Lead.deadline_at,
    }
    column = column_map[sort_by]
    if sort_order == "asc":
        return query.order_by(column.asc().nulls_last(), Lead.created_at.desc())
    return query.order_by(column.desc().nulls_last(), Lead.created_at.desc())


@router.get("", response_model=list[LeadResponse])
def list_leads(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None, min_length=1, max_length=255),
    status: str | None = Query(default=None),
    client_id: int | None = Query(default=None),
    scheduled_from: date | None = Query(default=None),
    scheduled_to: date | None = Query(default=None),
    sort_by: LeadSortField = Query(default="created_at"),
    sort_order: LeadSortOrder = Query(default="desc"),
):
    if scheduled_from and scheduled_to and scheduled_from > scheduled_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scheduled_from must be before or equal to scheduled_to",
        )

    query = (
        select(Lead)
        .join(Client)
        .options(joinedload(Lead.client), joinedload(Lead.assigned_to))
    )

    if status:
        if status not in LEAD_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed: {', '.join(LEAD_STATUSES)}",
            )
        query = query.where(Lead.status == status)

    if client_id is not None:
        query = query.where(Lead.client_id == client_id)

    if scheduled_from is not None:
        query = query.where(Lead.scheduled_date >= scheduled_from)

    if scheduled_to is not None:
        query = query.where(Lead.scheduled_date <= scheduled_to)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Lead.title.ilike(pattern),
                Lead.description.ilike(pattern),
                Client.full_name.ilike(pattern),
            )
        )

    query = _apply_sort(query, sort_by, sort_order)
    leads = list(db.scalars(query).all())
    return [_lead_to_response(lead) for lead in leads]


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _lead_to_response(_get_lead_or_404(db, lead_id))


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    payload: LeadCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    _ensure_client_exists(db, payload.client_id)

    data = payload.model_dump()
    assigned_to_id = data.get("assigned_to_id")
    if assigned_to_id is None:
        data["assigned_to_id"] = current_user.id
    else:
        _ensure_assignee_exists(db, assigned_to_id)

    lead = Lead(**data)
    db.add(lead)
    db.commit()
    return _lead_to_response(_get_lead_or_404(db, lead.id))


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    lead = _get_lead_or_404(db, lead_id)
    updates = payload.model_dump(exclude_unset=True)

    if "client_id" in updates and updates["client_id"] is not None:
        _ensure_client_exists(db, updates["client_id"])

    if "assigned_to_id" in updates and updates["assigned_to_id"] is not None:
        _ensure_assignee_exists(db, updates["assigned_to_id"])

    for field, value in updates.items():
        setattr(lead, field, value)

    db.commit()
    return _lead_to_response(_get_lead_or_404(db, lead.id))


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    lead = _get_lead_or_404(db, lead_id)
    db.delete(lead)
    db.commit()
