from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class ExerciseBase(BaseModel):
    name: str
    type: str
    muscle_group: str | None = None
    difficulty: str | None = None
    equipment: list[str] | None = None
    youtube_url: str | None = None
    met_value: Decimal | None = None


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseRead(ExerciseBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
