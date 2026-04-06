from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import ForeignKey, String, Boolean, SmallInteger, Numeric, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date)
    memo: Mapped[str | None] = mapped_column(Text)
    kcal: Mapped[int | None]
    duration_min: Mapped[int | None]
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="sessions")  # noqa: F821
    exercise_logs: Mapped[list["ExerciseLog"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="ExerciseLog.order_index"
    )


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("workout_sessions.id", ondelete="CASCADE"))
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"))
    order_index: Mapped[int | None] = mapped_column(SmallInteger)

    # cardio / flexibility
    duration_min: Mapped[int | None] = mapped_column(SmallInteger)
    distance_km: Mapped[Decimal | None] = mapped_column(Numeric(6, 3))
    speed_kmh: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    incline_pct: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    environment: Mapped[str | None] = mapped_column(String(20))

    memo: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    session: Mapped["WorkoutSession"] = relationship(back_populates="exercise_logs")
    exercise: Mapped["Exercise"] = relationship()  # noqa: F821
    sets: Mapped[list["ExerciseSet"]] = relationship(
        back_populates="exercise_log", cascade="all, delete-orphan", order_by="ExerciseSet.set_index"
    )


class ExerciseSet(Base):
    __tablename__ = "exercise_sets"

    id: Mapped[int] = mapped_column(primary_key=True)
    exercise_log_id: Mapped[int] = mapped_column(ForeignKey("exercise_logs.id", ondelete="CASCADE"))
    set_index: Mapped[int] = mapped_column(SmallInteger)

    reps: Mapped[int | None] = mapped_column(SmallInteger)
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))

    # bodyweight 전용
    is_assisted: Mapped[bool] = mapped_column(Boolean, default=False)
    assist_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))

    memo: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    exercise_log: Mapped["ExerciseLog"] = relationship(back_populates="sets")
