from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.models.sql.coach import Coach
from app.schemas.auth import SendOTPRequest, SendOTPResponse, VerifyOTPRequest, TokenResponse
from app.services.otp_service import create_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(payload: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    phone_full = f"{payload.phone_country_code}{payload.phone_number}"
    otp = await create_otp(db, phone_full)

    response: dict = {
        "message": "OTP sent successfully",
        "phone_full": f"{payload.phone_country_code}****{payload.phone_number[-3:]}",
    }
    if settings.ENVIRONMENT == "development":
        response["dev_otp"] = otp

    return response


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_endpoint(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    phone_full = f"{payload.phone_country_code}{payload.phone_number}"
    valid = await verify_otp(db, phone_full, payload.otp)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    result = await db.execute(
        select(Coach).where(Coach.phone_number == payload.phone_number)
    )
    coach = result.scalar_one_or_none()
    is_new = coach is None

    if is_new:
        coach = Coach(
            full_name="New Coach",
            phone_country_code=payload.phone_country_code,
            phone_number=payload.phone_number,
        )
        db.add(coach)
        await db.commit()
        await db.refresh(coach)

    token = create_access_token(str(coach.id))
    return TokenResponse(access_token=token, coach_id=coach.id, is_new_coach=is_new)
