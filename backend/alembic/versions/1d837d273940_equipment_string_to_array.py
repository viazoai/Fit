"""equipment_string_to_array

Revision ID: 1d837d273940
Revises: 8bdcc7fc327b
Create Date: 2026-04-03 23:14:19.404006

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY


revision: str = '1d837d273940'
down_revision: Union[str, Sequence[str], None] = '8bdcc7fc327b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. equipment: VARCHAR(50) → VARCHAR[]
    #    - '맨몸', '없음' → NULL (장비 불필요)
    #    - 그 외 단일 값 → 배열로 래핑
    op.execute("""
        ALTER TABLE exercises
        ALTER COLUMN equipment TYPE VARCHAR[]
        USING CASE
            WHEN equipment IN ('맨몸', '없음') THEN NULL
            WHEN equipment IS NULL THEN NULL
            ELSE ARRAY[equipment]
        END
    """)

    # 2. 특정 운동의 equipment를 실제 가능한 기구 목록으로 갱신
    op.execute("""
        UPDATE exercises SET equipment = ARRAY['바벨', '덤벨'] WHERE name IN ('벤치프레스', '밀리터리프레스', '바벨로우');
        UPDATE exercises SET equipment = ARRAY['바벨'] WHERE name IN ('데드리프트', '스쿼트');
        UPDATE exercises SET equipment = ARRAY['체스트프레스머신', '덤벨'] WHERE name = '체스트프레스';
        UPDATE exercises SET equipment = ARRAY['랫풀다운머신'] WHERE name = '렛풀다운';
        UPDATE exercises SET equipment = ARRAY['레그프레스머신'] WHERE name = '레그프레스';
        UPDATE exercises SET equipment = ARRAY['레그컬머신'] WHERE name = '레그컬';
        UPDATE exercises SET equipment = ARRAY['레그익스텐션머신'] WHERE name = '레그익스텐션';
        UPDATE exercises SET equipment = ARRAY['펙덱머신'] WHERE name = '버터플라이';
        UPDATE exercises SET equipment = ARRAY['스텝밀'] WHERE name = '스텝밀';
        UPDATE exercises SET equipment = ARRAY['자전거'] WHERE name = '라이딩';
    """)

    # 3. workout_sessions.duration_min: autogenerate 오탐 방지용 no-op
    #    (해당 컬럼은 이미 수동으로 ALTER TABLE 로 추가됨)


def downgrade() -> None:
    # 배열의 첫 번째 값만 취해 VARCHAR(50)으로 복원
    op.execute("""
        ALTER TABLE exercises
        ALTER COLUMN equipment TYPE VARCHAR(50)
        USING CASE
            WHEN equipment IS NULL THEN NULL
            ELSE equipment[1]
        END
    """)
