from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class OTPRecord(Base):
    __tablename__ = "otp_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    phone_full: Mapped[str] = mapped_column(String(30), index=True)
    otp_hash: Mapped[str] = mapped_column(String(255))
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
