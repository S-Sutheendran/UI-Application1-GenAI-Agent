from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_mongo_db
from app.core.deps import get_current_coach
from app.models.sql.coach import Coach
from app.schemas.meal import MealPlanCreate
from app.services.mongo_service import MealService

router = APIRouter(prefix="/meals", tags=["Meal Plans"])


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_meal_plan(
    payload: MealPlanCreate,
    coach: Coach = Depends(get_current_coach),
):
    svc = MealService(get_mongo_db())
    return await svc.create(coach.id, payload.model_dump())


@router.get("", response_model=list[dict])
async def list_meal_plans(coach: Coach = Depends(get_current_coach)):
    svc = MealService(get_mongo_db())
    return await svc.list_by_coach(coach.id)


@router.get("/client/{client_id}", response_model=list[dict])
async def list_client_meal_plans(client_id: int, coach: Coach = Depends(get_current_coach)):
    svc = MealService(get_mongo_db())
    return await svc.list_by_client(coach.id, client_id)
