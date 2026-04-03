"""
노션 raw 테이블(notion_workout_log_raw, notion_exercise_log_raw)의 데이터를
새 스키마(users, exercises, workout_sessions, exercise_logs, exercise_sets)로 변환 삽입.

사용법:
    source venv/bin/activate
    python migrate_notion_to_schema.py
"""
import os
import sys
from decimal import Decimal

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# .env 로드
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

sys.path.insert(0, os.path.dirname(__file__))
from app.db import Base
from app.models.user import User
from app.models.exercise import Exercise
from app.models.workout import WorkoutSession, ExerciseLog, ExerciseSet

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://fit:fit@localhost:5432/fit")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# --- 운동 종목 매핑 (SCHEMA.md 5절 기준) ---
EXERCISE_MAP = {
    "걷기":           {"type": "유산소",    "muscle_group": "없음"},
    "달리기":         {"type": "유산소",    "muscle_group": "없음"},
    "하이킹":         {"type": "유산소",    "muscle_group": "없음"},
    "라이딩":         {"type": "유산소",    "muscle_group": "없음"},
    "스텝밀":         {"type": "유산소",    "muscle_group": "없음"},
    "레그프레스":     {"type": "기구",      "muscle_group": "하체"},
    "레그익스텐션":   {"type": "기구",      "muscle_group": "하체"},
    "레그컬":         {"type": "기구",      "muscle_group": "하체"},
    "스쿼트":         {"type": "기구",      "muscle_group": "하체"},
    "렛풀다운":       {"type": "기구",      "muscle_group": "등"},
    "풀업":           {"type": "맨몸",      "muscle_group": "등"},
    "덤벨로우":       {"type": "기구",      "muscle_group": "등"},
    "바벨로우":       {"type": "기구",      "muscle_group": "등"},
    "데드리프트":     {"type": "기구",      "muscle_group": "전신"},
    "벤치프레스":     {"type": "기구",      "muscle_group": "가슴"},
    "체스트프레스":   {"type": "기구",      "muscle_group": "가슴"},
    "버터플라이":     {"type": "기구",      "muscle_group": "가슴"},
    "덤벨숄더프레스": {"type": "기구",      "muscle_group": "어깨"},
    "밀리터리프레스": {"type": "기구",      "muscle_group": "어깨"},
    "밀리터리 프레스": {"type": "기구",     "muscle_group": "어깨"},
    "사이드래터럴레이즈": {"type": "기구",  "muscle_group": "어깨"},
    "사이드 래터럴 레이즈": {"type": "기구", "muscle_group": "어깨"},
    "프론트레이즈":   {"type": "기구",      "muscle_group": "어깨"},
    "레그레이즈":     {"type": "기구",      "muscle_group": "코어"},
    "플랭크":         {"type": "맨몸",      "muscle_group": "코어"},
    "크런치":         {"type": "맨몸",      "muscle_group": "코어"},
    "스트레칭":       {"type": "스트레칭",  "muscle_group": "없음"},
}

# 노션 이름 → 표준화 이름 (띄어쓰기 통일)
NAME_NORMALIZE = {
    "밀리터리 프레스": "밀리터리프레스",
    "사이드 래터럴 레이즈": "사이드래터럴레이즈",
}


def get_or_create_exercise(db, name: str) -> Exercise:
    """운동 종목 조회 또는 생성"""
    normalized = NAME_NORMALIZE.get(name, name)
    ex = db.query(Exercise).filter(Exercise.name == normalized).first()
    if ex:
        return ex

    info = EXERCISE_MAP.get(name, EXERCISE_MAP.get(normalized))
    if not info:
        # 매핑에 없는 종목 — 기본값
        print(f"  [경고] 매핑 없음: '{name}' → 기구/없음 기본 적용")
        info = {"type": "기구", "muscle_group": "없음"}

    ex = Exercise(name=normalized, type=info["type"], muscle_group=info["muscle_group"])
    db.add(ex)
    db.flush()
    return ex


def migrate():
    db = Session()

    try:
        # 1. 기본 사용자 생성 (아직 없는 경우)
        user = db.query(User).filter(User.name == "조광일").first()
        if not user:
            user = User(name="조광일")
            db.add(user)
            db.flush()
            print(f"사용자 생성: {user.name} (id={user.id})")

        # 2. notion_workout_log_raw → workout_sessions
        workouts_raw = db.execute(text(
            "SELECT notion_id, name, date, kcal FROM notion_workout_log_raw ORDER BY date"
        )).fetchall()

        notion_id_to_session = {}
        for row in workouts_raw:
            session = WorkoutSession(
                user_id=user.id,
                date=row.date,
                memo=row.name,
                kcal=int(row.kcal) if row.kcal else None,
            )
            db.add(session)
            db.flush()
            notion_id_to_session[row.notion_id] = session

        print(f"workout_sessions: {len(notion_id_to_session)}개 생성")

        # 3. notion_exercise_log_raw → exercise_logs + exercise_sets
        exercises_raw = db.execute(text("""
            SELECT notion_id, exercise, date, sets, repeat, weight_kg,
                   time_min, muscle, category, failed, workout_log_ids
            FROM notion_exercise_log_raw
            ORDER BY date, notion_id
        """)).fetchall()

        log_count = 0
        set_count = 0
        orphan_count = 0

        for row in exercises_raw:
            exercise_name = row.exercise
            if not exercise_name or not exercise_name.strip():
                continue

            exercise = get_or_create_exercise(db, exercise_name.strip())

            # workout_log_ids에서 세션 찾기
            workout_ids = row.workout_log_ids or []
            session = None
            for wid in workout_ids:
                session = notion_id_to_session.get(wid)
                if session:
                    break

            if not session:
                # 날짜로 매칭 시도
                if row.date:
                    session = db.query(WorkoutSession).filter(
                        WorkoutSession.user_id == user.id,
                        WorkoutSession.date == row.date,
                    ).first()

            if not session:
                orphan_count += 1
                continue

            # exercise_log 생성
            order_idx = (
                db.query(ExerciseLog)
                .filter(ExerciseLog.session_id == session.id)
                .count()
            )

            log = ExerciseLog(
                session_id=session.id,
                exercise_id=exercise.id,
                order_index=order_idx,
                duration_min=Decimal(str(row.time_min)) if row.time_min else None,
                environment="treadmill" if exercise_name == "걷기" and row.time_min and row.time_min <= 15 else
                            "outdoor" if exercise_name in ("걷기", "달리기", "하이킹") else
                            "machine" if exercise_name == "스텝밀" else
                            "cycling" if exercise_name == "라이딩" else
                            None,
            )
            db.add(log)
            db.flush()
            log_count += 1

            # 기구/맨몸 → exercise_sets 생성
            if exercise.type in ("기구", "맨몸") and row.sets:
                num_sets = int(row.sets)
                reps = int(row.repeat) if row.repeat else None
                weight = Decimal(str(row.weight_kg)) if row.weight_kg else None

                for i in range(1, num_sets + 1):
                    s = ExerciseSet(
                        exercise_log_id=log.id,
                        set_index=i,
                        reps=reps,
                        weight_kg=weight,
                    )
                    db.add(s)
                    set_count += 1

        db.commit()

        print(f"exercise_logs: {log_count}개 생성")
        print(f"exercise_sets: {set_count}개 생성")
        if orphan_count:
            print(f"[경고] 세션 매칭 실패 (고아 레코드): {orphan_count}개")

        # 결과 확인
        print("\n--- exercises 마스터 ---")
        for ex in db.query(Exercise).order_by(Exercise.type, Exercise.name).all():
            print(f"  {ex.type:12s} | {ex.muscle_group:10s} | {ex.name}")

    except Exception as e:
        db.rollback()
        print(f"에러 발생: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
