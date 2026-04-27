from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_mongo_db
from app.core.deps import get_current_coach
from app.models.sql.coach import Coach
from app.schemas.insight import InsightCreate, ProgressSnapshot
from app.services.mongo_service import InsightService

router = APIRouter(prefix="/insights", tags=["Insights & Performance"])


@router.put("/client/{client_id}", response_model=dict)
async def upsert_insight(
    client_id: int,
    payload: InsightCreate,
    coach: Coach = Depends(get_current_coach),
):
    svc = InsightService(get_mongo_db())
    return await svc.upsert(coach.id, client_id, payload.model_dump())


@router.get("/client/{client_id}", response_model=dict)
async def get_insight(client_id: int, coach: Coach = Depends(get_current_coach)):
    svc = InsightService(get_mongo_db())
    data = await svc.get(coach.id, client_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No insights recorded yet")
    return data


@router.post("/client/{client_id}/progress", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_progress_snapshot(
    client_id: int,
    payload: ProgressSnapshot,
    coach: Coach = Depends(get_current_coach),
):
    svc = InsightService(get_mongo_db())
    return await svc.add_progress(coach.id, {"client_id": client_id, **payload.model_dump()})


@router.get("/client/{client_id}/progress", response_model=list[dict])
async def get_progress_history(client_id: int, coach: Coach = Depends(get_current_coach)):
    svc = InsightService(get_mongo_db())
    return await svc.get_progress_history(coach.id, client_id)
