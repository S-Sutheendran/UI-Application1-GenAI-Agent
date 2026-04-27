from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_mongo_db
from app.core.deps import get_current_coach
from app.models.sql.coach import Coach
from app.schemas.workout import WorkoutPlanCreate, WorkoutPlanOut
from app.services.mongo_service import WorkoutService

router = APIRouter(prefix="/workouts", tags=["Workout Plans"])


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_workout_plan(
    payload: WorkoutPlanCreate,
    coach: Coach = Depends(get_current_coach),
):
    svc = WorkoutService(get_mongo_db())
    return await svc.create(coach.id, payload.model_dump())


@router.get("", response_model=list[dict])
async def list_workout_plans(coach: Coach = Depends(get_current_coach)):
    svc = WorkoutService(get_mongo_db())
    return await svc.list_by_coach(coach.id)


@router.get("/client/{client_id}", response_model=list[dict])
async def list_client_workout_plans(
    client_id: int,
    coach: Coach = Depends(get_current_coach),
):
    svc = WorkoutService(get_mongo_db())
    return await svc.list_by_client(coach.id, client_id)


@router.get("/{plan_id}", response_model=dict)
async def get_workout_plan(plan_id: str, coach: Coach = Depends(get_current_coach)):
    svc = WorkoutService(get_mongo_db())
    plan = await svc.get(plan_id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout_plan(plan_id: str, coach: Coach = Depends(get_current_coach)):
    svc = WorkoutService(get_mongo_db())
    deleted = await svc.delete(plan_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
