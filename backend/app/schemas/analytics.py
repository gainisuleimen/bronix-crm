from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeAnalyticsResponse(BaseModel):
    user_id: int
    full_name: str | None
    email: EmailStr
    role: str
    total: int
    new: int
    in_progress: int
    completed: int
    cancelled: int

    model_config = ConfigDict(from_attributes=True)


class DashboardSummaryResponse(BaseModel):
    clients_total: int
    leads_total: int
    leads_new: int
    leads_in_progress: int
    leads_completed: int
    leads_cancelled: int
    employees: list[EmployeeAnalyticsResponse]