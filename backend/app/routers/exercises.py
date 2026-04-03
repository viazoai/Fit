from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseRead
from app.services.auth import get_current_user

router = APIRouter()


@router.get("", response_model=list[ExerciseRead])
def list_exercises(
    type: str | None = Query(None),
    muscle_group: str | None = Query(None),
    q: str | None = Query(None, description="이름 검색"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Exercise).filter(Exercise.is_active == True)  # noqa: E712
    if type:
        query = query.filter(Exercise.type == type)
    if muscle_group:
        query = query.filter(Exercise.muscle_group == muscle_group)
    if q:
        query = query.filter(Exercise.name.ilike(f"%{q}%"))
    return query.order_by(Exercise.name).all()


@router.get("/{exercise_id}", response_model=ExerciseRead)
def get_exercise(exercise_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="운동 종목을 찾을 수 없음")
    return exercise


@router.post("", response_model=ExerciseRead, status_code=201)
def create_exercise(body: ExerciseCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    exercise = Exercise(**body.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise
