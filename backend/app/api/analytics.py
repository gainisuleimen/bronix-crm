from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.client import Client
from app.models.lead import Lead
from app.models.user import User
from app.models.user_role import UserRole
from app.schemas.analytics import DashboardSummaryResponse, EmployeeAnalyticsResponse
from database import get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _fetch_employee_analytics(db: Session) -> list[EmployeeAnalyticsResponse]:
    query = (
        select(
            User.id.label("user_id"),
            User.full_name,
            User.email,
            UserRole.name.label("role"),
            func.count(Lead.id).label("total"),
            func.coalesce(func.sum(case((Lead.status == "new", 1), else_=0)), 0).label("new"),
            func.coalesce(
                func.sum(case((Lead.status == "in_progress", 1), else_=0)),
                0,
            ).label("in_progress"),
            func.coalesce(
                func.sum(case((Lead.status == "completed", 1), else_=0)),
                0,
            ).label("completed"),
            func.coalesce(
                func.sum(case((Lead.status == "cancelled", 1), else_=0)),
                0,
            ).label("cancelled"),
        )
        .join(UserRole, User.role_id == UserRole.id)
        .outerjoin(Lead, Lead.assigned_to_id == User.id)
        .where(User.is_active.is_(True))
        .group_by(User.id, User.full_name, User.email, UserRole.name)
        .order_by(
            func.coalesce(
                func.sum(case((Lead.status == "completed", 1), else_=0)),
                0,
            ).desc(),
            func.count(Lead.id).desc(),
            User.full_name.asc().nulls_last(),
        )
    )

    rows = db.execute(query).mappings().all()
    return [EmployeeAnalyticsResponse.model_validate(row) for row in rows]


@router.get("/dashboard", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    clients_total = db.scalar(select(func.count(Client.id))) or 0

    lead_stats = db.execute(
        select(
            func.count(Lead.id).label("total"),
            func.coalesce(func.sum(case((Lead.status == "new", 1), else_=0)), 0).label("new"),
            func.coalesce(
                func.sum(case((Lead.status == "in_progress", 1), else_=0)),
                0,
            ).label("in_progress"),
            func.coalesce(
                func.sum(case((Lead.status == "completed", 1), else_=0)),
                0,
            ).label("completed"),
            func.coalesce(
                func.sum(case((Lead.status == "cancelled", 1), else_=0)),
                0,
            ).label("cancelled"),
        )
    ).one()

    return DashboardSummaryResponse(
        clients_total=clients_total,
        leads_total=int(lead_stats.total or 0),
        leads_new=int(lead_stats.new or 0),
        leads_in_progress=int(lead_stats.in_progress or 0),
        leads_completed=int(lead_stats.completed or 0),
        leads_cancelled=int(lead_stats.cancelled or 0),
        employees=_fetch_employee_analytics(db),
    )


@router.get("/employees", response_model=list[EmployeeAnalyticsResponse])
def get_employee_analytics(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return _fetch_employee_analytics(db)
