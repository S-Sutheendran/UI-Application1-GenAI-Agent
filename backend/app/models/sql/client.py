from datetime import datetime, date
from sqlalchemy import String, Boolean, DateTime, Float, Text, Integer, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    coach_id: Mapped[int] = mapped_column(Integer, ForeignKey("coaches.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    fitness_goal: Mapped[str | None] = mapped_column(String(200), nullable=True)
    fitness_level: Mapped[str] = mapped_column(String(50), default="beginner")
    health_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_active: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    compliance_rate: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
