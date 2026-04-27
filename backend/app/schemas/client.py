from datetime import datetime, date
from pydantic import BaseModel


class ClientCreate(BaseModel):
    full_name: str
    email: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    fitness_goal: str | None = None
    fitness_level: str = "beginner"
    health_conditions: str | None = None
    avatar_url: str | None = None


class ClientUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    fitness_goal: str | None = None
    fitness_level: str | None = None
    health_conditions: str | None = None
    avatar_url: str | None = None


class ClientOut(BaseModel):
    id: int
    coach_id: int
    full_name: str
    email: str | None
    phone: str | None
    date_of_birth: date | None
    gender: str | None
    height_cm: float | None
    weight_kg: float | None
    fitness_goal: str | None
    fitness_level: str
    health_conditions: str | None
    avatar_url: str | None
    is_active: bool
    joined_at: datetime
    streak_days: int
    compliance_rate: float

    model_config = {"from_attributes": True}
