from datetime import datetime
from pydantic import BaseModel


class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest_seconds: int = 60
    notes: str | None = None
    video_url: str | None = None


class WorkoutDay(BaseModel):
    day: str
    focus: str
    exercises: list[Exercise]
    duration_minutes: int = 60


class WorkoutPlanCreate(BaseModel):
    client_id: int
    title: str
    description: str | None = None
    goal: str
    weeks: int = 4
    days_per_week: int = 5
    plan: list[WorkoutDay]
    notes: str | None = None


class WorkoutPlanOut(WorkoutPlanCreate):
    id: str
    coach_id: int
    created_at: datetime
    is_active: bool = True

    model_config = {"from_attributes": True}
