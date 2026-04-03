from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.user import User
from app.models.workout import WorkoutSession, ExerciseLog, ExerciseSet
from app.schemas.workout import (
    WorkoutSessionCreate,
    WorkoutSessionRead,
    WorkoutSessionUpdate,
    WorkoutSessionSummary,
    ExerciseLogRead,
)
from app.services.auth import get_current_user

router = APIRouter()


def _enrich_log(log: ExerciseLog) -> dict:
    """ExerciseLog → ExerciseLogRead에 exercise 정보 포함"""
    return ExerciseLogRead(
        id=log.id,
        exercise_id=log.exercise_id,
        order_index=log.order_index,
        duration_min=log.duration_min,
        distance_km=log.distance_km,
        speed_kmh=log.speed_kmh,
        incline_pct=log.incline_pct,
        environment=log.environment,
        memo=log.memo,
        sets=log.sets,
        exercise_name=log.exercise.name if log.exercise else None,
        exercise_type=log.exercise.type if log.exercise else None,
        muscle_group=log.exercise.muscle_group if log.exercise else None,
    )


@router.get("", response_model=list[WorkoutSessionSummary])
def list_workouts(
    start: date | None = Query(None),
    end: date | None = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user.id)
        .options(joinedload(WorkoutSession.exercise_logs).joinedload(ExerciseLog.exercise))
    )
    if start:
        query = query.filter(WorkoutSession.date >= start)
    if end:
        query = query.filter(WorkoutSession.date <= end)

    sessions = query.order_by(WorkoutSession.date.desc()).all()
    result = []
    for s in sessions:
        groups = list({log.exercise.muscle_group for log in s.exercise_logs if log.exercise and log.exercise.muscle_group})
        result.append(WorkoutSessionSummary(
            id=s.id, user_id=s.user_id, date=s.date, memo=s.memo, kcal=s.kcal,
            exercise_count=len(s.exercise_logs), muscle_groups=groups,
        ))
    return result


@router.get("/{session_id}", response_model=WorkoutSessionRead)
def get_workout(session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.id == session_id, WorkoutSession.user_id == user.id)
        .options(
            joinedload(WorkoutSession.exercise_logs)
            .joinedload(ExerciseLog.sets),
            joinedload(WorkoutSession.exercise_logs)
            .joinedload(ExerciseLog.exercise),
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="운동 세션을 찾을 수 없음")

    return WorkoutSessionRead(
        id=session.id, user_id=session.user_id, date=session.date,
        memo=session.memo, kcal=session.kcal, created_at=session.created_at,
        exercise_logs=[_enrich_log(log) for log in session.exercise_logs],
    )


@router.post("", response_model=WorkoutSessionRead, status_code=201)
def create_workout(body: WorkoutSessionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = WorkoutSession(user_id=user.id, date=body.date, memo=body.memo, kcal=body.kcal)
    db.add(session)
    db.flush()

    for log_data in body.exercise_logs:
        log = ExerciseLog(
            session_id=session.id,
            exercise_id=log_data.exercise_id,
            order_index=log_data.order_index,
            duration_min=log_data.duration_min,
            distance_km=log_data.distance_km,
            speed_kmh=log_data.speed_kmh,
            incline_pct=log_data.incline_pct,
            environment=log_data.environment,
            memo=log_data.memo,
        )
        db.add(log)
        db.flush()

        for set_data in log_data.sets:
            s = ExerciseSet(
                exercise_log_id=log.id,
                set_index=set_data.set_index,
                reps=set_data.reps,
                weight_kg=set_data.weight_kg,
                is_assisted=set_data.is_assisted,
                assist_weight_kg=set_data.assist_weight_kg,
                memo=set_data.memo,
            )
            db.add(s)

    db.commit()
    db.refresh(session)
    return get_workout(session.id, db, user)


@router.put("/{session_id}", response_model=WorkoutSessionRead)
def update_workout(
    session_id: int,
    body: WorkoutSessionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id, WorkoutSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="운동 세션을 찾을 수 없음")

    if body.memo is not None:
        session.memo = body.memo
    if body.kcal is not None:
        session.kcal = body.kcal

    if body.exercise_logs is not None:
        # 기존 로그 삭제 후 재생성
        db.query(ExerciseLog).filter(ExerciseLog.session_id == session.id).delete()
        db.flush()

        for log_data in body.exercise_logs:
            log = ExerciseLog(
                session_id=session.id,
                exercise_id=log_data.exercise_id,
                order_index=log_data.order_index,
                duration_min=log_data.duration_min,
                distance_km=log_data.distance_km,
                speed_kmh=log_data.speed_kmh,
                incline_pct=log_data.incline_pct,
                environment=log_data.environment,
                memo=log_data.memo,
            )
            db.add(log)
            db.flush()

            for set_data in log_data.sets:
                s = ExerciseSet(
                    exercise_log_id=log.id,
                    set_index=set_data.set_index,
                    reps=set_data.reps,
                    weight_kg=set_data.weight_kg,
                    is_assisted=set_data.is_assisted,
                    assist_weight_kg=set_data.assist_weight_kg,
                    memo=set_data.memo,
                )
                db.add(s)

    db.commit()
    db.refresh(session)
    return get_workout(session.id, db, user)
