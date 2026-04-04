from datetime import datetime
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    login_id: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(128))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    theme: Mapped[str] = mapped_column(String(10), default="dark", server_default="dark")
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="user")  # noqa: F821
    body_compositions: Mapped[list["BodyComposition"]] = relationship(back_populates="user")  # noqa: F821
