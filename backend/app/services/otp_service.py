import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.sql.otp import OTPRecord
from app.core.security import hash_password, verify_password
from app.core.config import settings


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


async def create_otp(db: AsyncSession, phone_full: str) -> str:
    otp = _generate_otp()
    hashed = hash_password(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    record = OTPRecord(
        phone_full=phone_full,
        otp_hash=hashed,
        expires_at=expires_at,
    )
    db.add(record)
    await db.commit()
    return otp


async def verify_otp(db: AsyncSession, phone_full: str, otp: str) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OTPRecord)
        .where(
            OTPRecord.phone_full == phone_full,
            OTPRecord.is_used == False,  # noqa: E712
            OTPRecord.expires_at > now,
        )
        .order_by(OTPRecord.created_at.desc())
        .limit(1)
    )
    record = result.scalar_one_or_none()
    if not record:
        return False

    if record.attempts >= 5:
        return False

    await db.execute(
        update(OTPRecord)
        .where(OTPRecord.id == record.id)
        .values(attempts=OTPRecord.attempts + 1)
    )
    await db.commit()

    if not verify_password(otp, record.otp_hash):
        return False

    await db.execute(
        update(OTPRecord).where(OTPRecord.id == record.id).values(is_used=True)
    )
    await db.commit()
    return True
