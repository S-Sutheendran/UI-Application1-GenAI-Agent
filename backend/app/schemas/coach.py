from datetime import datetime
from pydantic import BaseModel, EmailStr


class CoachBase(BaseModel):
    full_name: str
    phone_country_code: str
    phone_number: str
    email: EmailStr | None = None
    bio: str | None = None
    specialization: str | None = None
    experience_years: int = 0
    certifications: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None


class CoachCreate(CoachBase):
    pass


class CoachUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    bio: str | None = None
    specialization: str | None = None
    experience_years: int | None = None
    certifications: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None


class CoachOut(CoachBase):
    id: int
    rating: float
    total_clients: int
    total_sessions: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CoachStats(BaseModel):
    total_clients: int
    active_clients: int
    total_sessions: int
    avg_compliance: float
    avg_rating: float
    monthly_revenue: float
    workouts_assigned: int
    meal_plans_created: int
