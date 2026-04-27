from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_token
from app.models.sql.coach import Coach

bearer_scheme = HTTPBearer()


async def get_current_coach(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Coach:
    token = credentials.credentials
    coach_id = verify_token(token)
    if not coach_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    result = await db.execute(select(Coach).where(Coach.id == int(coach_id)))
    coach = result.scalar_one_or_none()
    if not coach or not coach.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Coach not found or inactive")
    return coach
