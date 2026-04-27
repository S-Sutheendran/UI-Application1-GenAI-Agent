from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import get_current_coach
from app.models.sql.coach import Coach
from app.models.sql.client import Client
from app.schemas.coach import CoachOut, CoachUpdate, CoachStats

router = APIRouter(prefix="/coach", tags=["Coach"])


@router.get("/me", response_model=CoachOut)
async def get_my_profile(coach: Coach = Depends(get_current_coach)):
    return coach


@router.put("/me", response_model=CoachOut)
async def update_my_profile(
    payload: CoachUpdate,
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(coach, field, value)
    await db.commit()
    await db.refresh(coach)
    return coach


@router.get("/me/stats", response_model=CoachStats)
async def get_coach_stats(
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(select(func.count()).where(Client.coach_id == coach.id))
    active = await db.scalar(
        select(func.count()).where(Client.coach_id == coach.id, Client.is_active == True)  # noqa
    )
    avg_compliance = await db.scalar(
        select(func.avg(Client.compliance_rate)).where(Client.coach_id == coach.id)
    )
    return CoachStats(
        total_clients=total or 0,
        active_clients=active or 0,
        total_sessions=coach.total_sessions,
        avg_compliance=round(avg_compliance or 0.0, 1),
        avg_rating=coach.rating,
        monthly_revenue=0.0,
        workouts_assigned=0,
        meal_plans_created=0,
    )
