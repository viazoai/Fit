from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.workout import WorkoutSession
from app.schemas.calendar import CalendarDay, CalendarResponse
from app.services.auth import get_current_user

router = APIRouter()


@router.get("", response_model=CalendarResponse)
def get_calendar(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """월간 운동 현황 — 모든 사용자 (부부 2인) 데이터 반환"""
    rows = (
        db.query(
            WorkoutSession.date,
            WorkoutSession.user_id,
            func.count(WorkoutSession.id).label("cnt"),
        )
        .filter(
            extract("year", WorkoutSession.date) == year,
            extract("month", WorkoutSession.date) == month,
        )
        .group_by(WorkoutSession.date, WorkoutSession.user_id)
        .all()
    )

    # 날짜별로 묶기
    day_map: dict[date, CalendarDay] = {}
    for row in rows:
        d = row.date
        if d not in day_map:
            day_map[d] = CalendarDay(date=d, user_ids=[], session_count=0)
        day_map[d].user_ids.append(row.user_id)
        day_map[d].session_count += row.cnt

    return CalendarResponse(
        year=year,
        month=month,
        days=sorted(day_map.values(), key=lambda x: x.date),
    )
