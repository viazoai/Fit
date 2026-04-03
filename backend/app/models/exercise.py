from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Boolean, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

EXERCISE_TYPES = ("기구", "맨몸", "유산소", "스트레칭")
MUSCLE_GROUPS = (
    "가슴", "등", "어깨", "하체", "코어",
    "이두", "삼두", "전신", "없음",
)
DIFFICULTIES = ("초급", "중급", "고급")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    type: Mapped[str] = mapped_column(String(20))
    muscle_group: Mapped[str | None] = mapped_column(String(20))
    difficulty: Mapped[str | None] = mapped_column(String(10))
    equipment: Mapped[str | None] = mapped_column(String(50))
    youtube_url: Mapped[str | None] = mapped_column(Text)
    met_value: Mapped[Decimal | None] = mapped_column(Numeric(4, 1))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
