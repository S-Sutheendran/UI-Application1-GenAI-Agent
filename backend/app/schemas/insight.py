from datetime import datetime
from pydantic import BaseModel


class HabitEntry(BaseModel):
    date: str
    habit: str
    completed: bool
    notes: str | None = None


class PerformanceEntry(BaseModel):
    date: str
    metric: str
    value: float
    unit: str


class InsightCreate(BaseModel):
    client_id: int
    coach_notes: str | None = None
    habits: list[HabitEntry] = []
    performance: list[PerformanceEntry] = []
    recommendations: list[str] = []


class InsightOut(InsightCreate):
    id: str
    coach_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProgressSnapshot(BaseModel):
    client_id: int
    date: str
    weight_kg: float | None = None
    body_fat_pct: float | None = None
    muscle_mass_kg: float | None = None
    bmi: float | None = None
    vo2_max: float | None = None
    resting_hr: int | None = None
    photos: list[str] = []
    notes: str | None = None
