from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal


# --- ExerciseSet ---

class ExerciseSetBase(BaseModel):
    set_index: int
    reps: int | None = None
    weight_kg: Decimal | None = None
    is_assisted: bool = False
    assist_weight_kg: Decimal | None = None
    memo: str | None = None


class ExerciseSetCreate(ExerciseSetBase):
    pass


class ExerciseSetRead(ExerciseSetBase):
    id: int
    model_config = {"from_attributes": True}


# --- ExerciseLog ---

class ExerciseLogBase(BaseModel):
    exercise_id: int
    order_index: int | None = None
    duration_min: Decimal | None = None
    distance_km: Decimal | None = None
    speed_kmh: Decimal | None = None
    incline_pct: Decimal | None = None
    environment: str | None = None
    memo: str | None = None


class ExerciseLogCreate(ExerciseLogBase):
    sets: list[ExerciseSetCreate] = []


class ExerciseLogRead(ExerciseLogBase):
    id: int
    sets: list[ExerciseSetRead] = []
    exercise_name: str | None = None
    exercise_type: str | None = None
    muscle_group: str | None = None

    model_config = {"from_attributes": True}


# --- WorkoutSession ---

class WorkoutSessionBase(BaseModel):
    date: date
    memo: str | None = None
    kcal: int | None = None


class WorkoutSessionCreate(WorkoutSessionBase):
    exercise_logs: list[ExerciseLogCreate] = []


class WorkoutSessionUpdate(BaseModel):
    memo: str | None = None
    kcal: int | None = None
    exercise_logs: list[ExerciseLogCreate] | None = None


class WorkoutSessionRead(WorkoutSessionBase):
    id: int
    user_id: int
    created_at: datetime
    exercise_logs: list[ExerciseLogRead] = []

    model_config = {"from_attributes": True}


class WorkoutSessionSummary(BaseModel):
    """캘린더/목록용 요약"""
    id: int
    user_id: int
    date: date
    memo: str | None
    kcal: int | None
    exercise_count: int
    muscle_groups: list[str]

    model_config = {"from_attributes": True}
