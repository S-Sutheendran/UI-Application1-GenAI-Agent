from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.deps import get_current_coach
from app.models.sql.coach import Coach
from app.models.sql.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientOut

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("", response_model=list[ClientOut])
async def list_clients(
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.coach_id == coach.id).order_by(Client.joined_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ClientOut, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    client = Client(**payload.model_dump(), coach_id=coach.id)
    db.add(client)
    await db.execute(
        update(Coach).where(Coach.id == coach.id).values(total_clients=Coach.total_clients + 1)
    )
    await db.commit()
    await db.refresh(client)
    return client


@router.get("/{client_id}", response_model=ClientOut)
async def get_client(
    client_id: int,
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.coach_id == coach.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientOut)
async def update_client(
    client_id: int,
    payload: ClientUpdate,
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.coach_id == coach.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(client, field, value)
    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    coach: Coach = Depends(get_current_coach),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.coach_id == coach.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    await db.delete(client)
    await db.commit()
