"""
notion_migration.py
Notion 운동 기록 데이터를 PostgreSQL 마이그레이션 테이블에 저장하는 스크립트.

- notion_workout_log_raw   : Workout Log DB 원본 보존
- notion_exercise_log_raw  : Exercise Counts Log DB 원본 보존

Phase 2 스키마 설계 시 참고 데이터로 활용한다.
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

# 프로젝트 루트의 .env 로드 (backend/ 에서 한 단계 위)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# ---------------------------------------------------------------------------
# 로깅 설정
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 환경변수
# ---------------------------------------------------------------------------
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_WORKOUT_DB_ID = os.getenv("NOTION_WORKOUT_DB_ID")
NOTION_EXERCISE_LOG_DB_ID = os.getenv("NOTION_EXERCISE_LOG_DB_ID")
DATABASE_URL = os.getenv("DATABASE_URL")


def _check_env() -> None:
    """필수 환경변수 존재 여부 검증."""
    missing = []
    if not NOTION_TOKEN:
        missing.append("NOTION_TOKEN")
    if not NOTION_WORKOUT_DB_ID:
        missing.append("NOTION_WORKOUT_DB_ID")
    if not NOTION_EXERCISE_LOG_DB_ID:
        missing.append("NOTION_EXERCISE_LOG_DB_ID")
    if missing:
        logger.error("누락된 환경변수: %s", ", ".join(missing))
        sys.exit(1)


# ---------------------------------------------------------------------------
# Notion API 헬퍼
# ---------------------------------------------------------------------------

def _get_notion_client():
    """하위 호환용. 현재는 httpx 직접 호출로 대체되어 사용되지 않는다."""
    pass


def _get_notion_headers() -> dict:
    """Notion API 공통 헤더를 반환한다."""
    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
    }


def fetch_all_pages(notion, database_id: str) -> list[dict]:
    """
    Notion DB의 모든 페이지를 페이지네이션하여 가져온다.
    한 번에 최대 100개씩 요청하고 has_more가 False가 될 때까지 반복한다.

    httpx를 직접 사용하여 notion-client 버전 의존성을 피한다.
    (notion-client는 패키지 임포트 확인용으로만 활용)
    """
    try:
        import httpx
    except ImportError:
        logger.error("httpx 패키지가 없습니다. pip install httpx 실행 후 재시도하세요.")
        sys.exit(1)

    url = f"https://api.notion.com/v1/databases/{database_id}/query"
    headers = _get_notion_headers()
    results = []
    start_cursor = None

    with httpx.Client(timeout=30.0) as client:
        while True:
            body: dict = {"page_size": 100}
            if start_cursor:
                body["start_cursor"] = start_cursor

            response = client.post(url, headers=headers, json=body)
            response.raise_for_status()
            data = response.json()

            pages = data.get("results", [])
            results.extend(pages)

            logger.info("  페이지 %d개 로드 (누적: %d개)", len(pages), len(results))

            if not data.get("has_more"):
                break
            start_cursor = data.get("next_cursor")

    return results


# ---------------------------------------------------------------------------
# 프로퍼티 파싱 유틸
# ---------------------------------------------------------------------------

def _extract_title(prop: dict) -> str | None:
    """title 타입 프로퍼티에서 텍스트 추출."""
    texts = prop.get("title", [])
    return "".join(t.get("plain_text", "") for t in texts) or None


def _extract_rich_text(prop: dict) -> str | None:
    """rich_text 타입 프로퍼티에서 텍스트 추출."""
    texts = prop.get("rich_text", [])
    return "".join(t.get("plain_text", "") for t in texts) or None


def _extract_number(prop: dict) -> float | None:
    """number 타입 프로퍼티 값 추출."""
    return prop.get("number")


def _extract_date(prop: dict) -> str | None:
    """date 타입 프로퍼티의 start 값 추출 (ISO 문자열)."""
    date_obj = prop.get("date")
    if date_obj:
        return date_obj.get("start")
    return None


def _extract_select(prop: dict) -> str | None:
    """select 타입 프로퍼티의 이름 추출."""
    sel = prop.get("select")
    if sel:
        return sel.get("name")
    return None


def _extract_multi_select(prop: dict) -> list[str]:
    """multi_select 타입 프로퍼티의 이름 목록 추출."""
    items = prop.get("multi_select", [])
    return [item.get("name") for item in items if item.get("name")]


def _extract_checkbox(prop: dict) -> bool | None:
    """checkbox 타입 프로퍼티 값 추출."""
    val = prop.get("checkbox")
    return val if isinstance(val, bool) else None


def _extract_url(prop: dict) -> str | None:
    """url 타입 프로퍼티 값 추출."""
    return prop.get("url")


def _extract_formula(prop: dict) -> str | None:
    """formula 타입 프로퍼티 값 추출 (string/number/boolean/date 지원)."""
    formula = prop.get("formula", {})
    ftype = formula.get("type")
    if ftype == "string":
        return formula.get("string")
    if ftype == "number":
        val = formula.get("number")
        return str(val) if val is not None else None
    if ftype == "boolean":
        val = formula.get("boolean")
        return str(val) if val is not None else None
    if ftype == "date":
        d = formula.get("date")
        return d.get("start") if d else None
    return None


def _extract_rollup(prop: dict) -> dict:
    """
    rollup 타입 프로퍼티 전체를 dict로 반환한다.
    rollup은 타입이 다양하므로 원본 구조를 그대로 보존한다.
    """
    return prop.get("rollup", {})


def _extract_relation_ids(prop: dict) -> list[str]:
    """relation 타입 프로퍼티에서 연결된 페이지 ID 목록 추출."""
    items = prop.get("relation", [])
    return [item.get("id") for item in items if item.get("id")]


# ---------------------------------------------------------------------------
# Workout Log 파싱
# ---------------------------------------------------------------------------

def parse_workout_log_page(page: dict) -> dict:
    """
    Workout Log DB 한 페이지를 파싱하여 저장용 dict로 변환한다.
    rollup/formula 컬럼은 JSON으로 보존한다.
    """
    props = page.get("properties", {})
    notion_id = page.get("id", "")

    parsed = {
        "notion_id": notion_id,
        # 기본 프로퍼티
        "name": _extract_title(props.get("Name", {})),
        "date": _extract_date(props.get("Date", {})),
        "kcal": _extract_number(props.get("Kcal", {})),
        "url": _extract_url(props.get("URL", {})),
        "created_time": page.get("created_time"),
        "last_edited_time": page.get("last_edited_time"),
        # formula 컬럼 (요일 문자열)
        "week_formula": _extract_formula(props.get("Week", {})),
        # rollup 컬럼 — JSON으로 원본 보존
        # Notion DB에서 실제 필드명은 "Time  (min)" (공백 2개)
        "time_min_rollup": json.dumps(_extract_rollup(props.get("Time  (min)", {})), ensure_ascii=False),
        "exercise_rollup": json.dumps(_extract_rollup(props.get("Exercise", {})), ensure_ascii=False),
        "category_rollup": json.dumps(_extract_rollup(props.get("Category", {})), ensure_ascii=False),
        "muscle_rollup": json.dumps(_extract_rollup(props.get("Muscle", {})), ensure_ascii=False),
        # relation
        "exercise_log_ids": json.dumps(
            _extract_relation_ids(props.get("🏋🏼 Exercise Counts Log", {})), ensure_ascii=False
        ),
        # 전체 원본 보존
        "raw_json": json.dumps(page, ensure_ascii=False, default=str),
    }
    return parsed


# ---------------------------------------------------------------------------
# Exercise Counts Log 파싱
# ---------------------------------------------------------------------------

def parse_exercise_log_page(page: dict) -> dict:
    """
    Exercise Counts Log DB 한 페이지를 파싱하여 저장용 dict로 변환한다.
    """
    props = page.get("properties", {})
    notion_id = page.get("id", "")

    # Exercise 컬럼이 select인 경우와 title인 경우를 모두 처리
    exercise_prop = props.get("Exercise", {})
    if exercise_prop.get("type") == "title":
        exercise_val = _extract_title(exercise_prop)
    else:
        exercise_val = _extract_select(exercise_prop)

    parsed = {
        "notion_id": notion_id,
        "exercise": exercise_val,
        "date": _extract_date(props.get("Date", {})),
        "sets": _extract_number(props.get("Sets", {})),
        "repeat": _extract_number(props.get("Repeat", {})),
        "weight_kg": _extract_number(props.get("Weight (kg)", {})),
        "time_min": _extract_number(props.get("Time (min)", {})),
        "muscle": json.dumps(
            _extract_multi_select(props.get("Muscle", {})), ensure_ascii=False
        ),
        "category": _extract_select(props.get("Category", {})),
        "failed": _extract_checkbox(props.get("Failed", {})),
        "created_time": page.get("created_time"),
        "last_edited_time": page.get("last_edited_time"),
        # rollup 원본 보존
        "week_rollup": json.dumps(_extract_rollup(props.get("Week", {})), ensure_ascii=False),
        # relation
        "workout_log_ids": json.dumps(
            _extract_relation_ids(props.get("💪🏼 Workout Log", {})), ensure_ascii=False
        ),
        # 전체 원본 보존
        "raw_json": json.dumps(page, ensure_ascii=False, default=str),
    }
    return parsed


# ---------------------------------------------------------------------------
# PostgreSQL DDL
# ---------------------------------------------------------------------------

DDL_WORKOUT_LOG_RAW = """
CREATE TABLE IF NOT EXISTS notion_workout_log_raw (
    notion_id           TEXT PRIMARY KEY,
    name                TEXT,
    date                DATE,
    kcal                NUMERIC,
    url                 TEXT,
    created_time        TIMESTAMPTZ,
    last_edited_time    TIMESTAMPTZ,
    week_formula        TEXT,
    time_min_rollup     JSONB,
    exercise_rollup     JSONB,
    category_rollup     JSONB,
    muscle_rollup       JSONB,
    exercise_log_ids    JSONB,
    raw_json            JSONB,
    synced_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

DDL_EXERCISE_LOG_RAW = """
CREATE TABLE IF NOT EXISTS notion_exercise_log_raw (
    notion_id           TEXT PRIMARY KEY,
    exercise            TEXT,
    date                DATE,
    sets                NUMERIC,
    repeat              NUMERIC,
    weight_kg           NUMERIC,
    time_min            NUMERIC,
    muscle              JSONB,
    category            TEXT,
    failed              BOOLEAN,
    created_time        TIMESTAMPTZ,
    last_edited_time    TIMESTAMPTZ,
    week_rollup         JSONB,
    workout_log_ids     JSONB,
    raw_json            JSONB,
    synced_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

# upsert SQL (notion_id 기준)
UPSERT_WORKOUT_LOG = """
INSERT INTO notion_workout_log_raw (
    notion_id, name, date, kcal, url,
    created_time, last_edited_time, week_formula,
    time_min_rollup, exercise_rollup, category_rollup, muscle_rollup,
    exercise_log_ids, raw_json, synced_at
) VALUES (
    %(notion_id)s, %(name)s, %(date)s, %(kcal)s, %(url)s,
    %(created_time)s, %(last_edited_time)s, %(week_formula)s,
    %(time_min_rollup)s::jsonb, %(exercise_rollup)s::jsonb,
    %(category_rollup)s::jsonb, %(muscle_rollup)s::jsonb,
    %(exercise_log_ids)s::jsonb, %(raw_json)s::jsonb, %(synced_at)s
)
ON CONFLICT (notion_id) DO UPDATE SET
    name             = EXCLUDED.name,
    date             = EXCLUDED.date,
    kcal             = EXCLUDED.kcal,
    url              = EXCLUDED.url,
    last_edited_time = EXCLUDED.last_edited_time,
    week_formula     = EXCLUDED.week_formula,
    time_min_rollup  = EXCLUDED.time_min_rollup,
    exercise_rollup  = EXCLUDED.exercise_rollup,
    category_rollup  = EXCLUDED.category_rollup,
    muscle_rollup    = EXCLUDED.muscle_rollup,
    exercise_log_ids = EXCLUDED.exercise_log_ids,
    raw_json         = EXCLUDED.raw_json,
    synced_at        = EXCLUDED.synced_at;
"""

UPSERT_EXERCISE_LOG = """
INSERT INTO notion_exercise_log_raw (
    notion_id, exercise, date, sets, repeat, weight_kg, time_min,
    muscle, category, failed,
    created_time, last_edited_time,
    week_rollup, workout_log_ids, raw_json, synced_at
) VALUES (
    %(notion_id)s, %(exercise)s, %(date)s, %(sets)s, %(repeat)s,
    %(weight_kg)s, %(time_min)s,
    %(muscle)s::jsonb, %(category)s, %(failed)s,
    %(created_time)s, %(last_edited_time)s,
    %(week_rollup)s::jsonb, %(workout_log_ids)s::jsonb,
    %(raw_json)s::jsonb, %(synced_at)s
)
ON CONFLICT (notion_id) DO UPDATE SET
    exercise         = EXCLUDED.exercise,
    date             = EXCLUDED.date,
    sets             = EXCLUDED.sets,
    repeat           = EXCLUDED.repeat,
    weight_kg        = EXCLUDED.weight_kg,
    time_min         = EXCLUDED.time_min,
    muscle           = EXCLUDED.muscle,
    category         = EXCLUDED.category,
    failed           = EXCLUDED.failed,
    last_edited_time = EXCLUDED.last_edited_time,
    week_rollup      = EXCLUDED.week_rollup,
    workout_log_ids  = EXCLUDED.workout_log_ids,
    raw_json         = EXCLUDED.raw_json,
    synced_at        = EXCLUDED.synced_at;
"""


# ---------------------------------------------------------------------------
# DB 저장
# ---------------------------------------------------------------------------

def save_to_db(parsed_rows: list[dict], upsert_sql: str, ddl_sql: str, table_name: str) -> int:
    """
    파싱된 레코드 목록을 PostgreSQL에 upsert한다.
    DATABASE_URL이 없으면 건너뛴다.
    """
    if not DATABASE_URL:
        logger.warning("DATABASE_URL이 없어 DB 저장을 건너뜁니다.")
        return 0

    try:
        import psycopg2
    except ImportError:
        logger.error("psycopg2 패키지가 없습니다. pip install psycopg2-binary 실행 후 재시도하세요.")
        return 0

    synced_at = datetime.now(timezone.utc)
    for row in parsed_rows:
        row["synced_at"] = synced_at

    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn:
            with conn.cursor() as cur:
                # 테이블 생성 (없는 경우)
                cur.execute(ddl_sql)
                # upsert
                cur.executemany(upsert_sql, parsed_rows)
        logger.info("[%s] %d개 레코드 upsert 완료", table_name, len(parsed_rows))
        return len(parsed_rows)
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# dry-run: DB 없이 Notion API 응답만 확인
# ---------------------------------------------------------------------------

def dry_run_preview(workout_rows: list[dict], exercise_rows: list[dict]) -> None:
    """파싱 결과 샘플을 출력한다 (DB 연결 없이 동작 검증)."""
    print("\n" + "=" * 60)
    print("=== DRY-RUN 미리보기 (DB 저장 안 함) ===")
    print("=" * 60)

    print(f"\n[Workout Log] 총 {len(workout_rows)}개")
    if workout_rows:
        sample = workout_rows[0].copy()
        # raw_json은 너무 길어서 생략
        sample["raw_json"] = "(생략)"
        for k, v in sample.items():
            print(f"  {k}: {v}")

    print(f"\n[Exercise Counts Log] 총 {len(exercise_rows)}개")
    if exercise_rows:
        sample = exercise_rows[0].copy()
        sample["raw_json"] = "(생략)"
        for k, v in sample.items():
            print(f"  {k}: {v}")

    print("\n" + "=" * 60)


# ---------------------------------------------------------------------------
# 메인
# ---------------------------------------------------------------------------

def main(dry_run: bool = False) -> None:
    """
    메인 실행 함수.

    Args:
        dry_run: True이면 DB 저장 없이 Notion API 응답만 확인한다.
    """
    _check_env()

    # 1. Workout Log 동기화
    logger.info("Workout Log DB 페이지 로딩 시작 (DB ID: %s)", NOTION_WORKOUT_DB_ID)
    workout_pages = fetch_all_pages(None, NOTION_WORKOUT_DB_ID)
    logger.info("Workout Log 총 %d개 페이지 로드 완료", len(workout_pages))

    workout_rows = [parse_workout_log_page(p) for p in workout_pages]

    # 2. Exercise Counts Log 동기화
    logger.info("Exercise Counts Log DB 페이지 로딩 시작 (DB ID: %s)", NOTION_EXERCISE_LOG_DB_ID)
    exercise_pages = fetch_all_pages(None, NOTION_EXERCISE_LOG_DB_ID)
    logger.info("Exercise Counts Log 총 %d개 페이지 로드 완료", len(exercise_pages))

    exercise_rows = [parse_exercise_log_page(p) for p in exercise_pages]

    if dry_run:
        dry_run_preview(workout_rows, exercise_rows)
        return

    # 3. DB 저장
    saved_workout = save_to_db(
        workout_rows, UPSERT_WORKOUT_LOG, DDL_WORKOUT_LOG_RAW, "notion_workout_log_raw"
    )
    saved_exercise = save_to_db(
        exercise_rows, UPSERT_EXERCISE_LOG, DDL_EXERCISE_LOG_RAW, "notion_exercise_log_raw"
    )

    print("\n동기화 완료")
    print(f"  notion_workout_log_raw  : {saved_workout}개")
    print(f"  notion_exercise_log_raw : {saved_exercise}개")


if __name__ == "__main__":
    # --dry-run 플래그로 DB 없이 Notion API 응답만 확인
    is_dry_run = "--dry-run" in sys.argv
    main(dry_run=is_dry_run)
