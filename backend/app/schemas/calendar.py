from pydantic import BaseModel
from datetime import date


class CalendarDay(BaseModel):
    date: date
    user_ids: list[int]
    session_count: int


class CalendarResponse(BaseModel):
    year: int
    month: int
    days: list[CalendarDay]
