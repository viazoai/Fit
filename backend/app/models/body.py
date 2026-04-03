from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import ForeignKey, Numeric, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class BodyComposition(Base):
    __tablename__ = "body_compositions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    measured_at: Mapped[date] = mapped_column(Date)

    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    body_fat_pct: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))
    muscle_mass_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    bmi: Mapped[Decimal | None] = mapped_column(Numeric(4, 2))

    memo: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="body_compositions")  # noqa: F821
