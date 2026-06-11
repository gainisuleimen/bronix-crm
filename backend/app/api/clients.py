from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.client import Client
from app.models.lead import Lead
from app.models.user import User
from app.schemas.client import ClientCreate, ClientDeleteResponse, ClientResponse, ClientUpdate
from database import get_db

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
def list_clients(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None, min_length=1, max_length=255),
):
    query = select(Client).order_by(Client.created_at.desc())

    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Client.full_name.ilike(pattern),
                Client.phone.ilike(pattern),
                Client.email.ilike(pattern),
                Client.address.ilike(pattern),
                Client.comment.ilike(pattern),
            )
        )

    return list(db.scalars(query).all())


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    client = Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    payload: ClientUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", response_model=ClientDeleteResponse)
def delete_client(
    client_id: int,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    client = db.get(Client, client_id)
    if client is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    leads_count = db.scalar(
        select(func.count()).select_from(Lead).where(Lead.client_id == client_id)
    ) or 0

    try:
        if leads_count:
            db.execute(delete(Lead).where(Lead.client_id == client_id))
        db.delete(client)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя удалить клиента: есть связанные записи в системе",
        ) from exc

    return ClientDeleteResponse(ok=True, id=client_id, deleted_leads=leads_count)
