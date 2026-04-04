"""add login auth columns

Revision ID: a3f1c8e92b01
Revises: 1d837d273940
Create Date: 2026-04-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a3f1c8e92b01"
down_revision: Union[str, None] = "2218027d9c38"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. 새 컬럼 추가 (nullable로 시작)
    op.add_column("users", sa.Column("login_id", sa.String(50), nullable=True))
    op.add_column("users", sa.Column("password_hash", sa.String(128), nullable=True))
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("users", sa.Column("is_approved", sa.Boolean(), server_default="false", nullable=False))

    # 2. 기존 데이터 마이그레이션
    # pin_hash -> password_hash 복사
    op.execute("UPDATE users SET password_hash = pin_hash")
    # 형준 -> zoai (admin), 나머지 -> name 기반 login_id
    op.execute("UPDATE users SET login_id = 'zoai', is_admin = true, is_approved = true WHERE name = '형준'")
    op.execute("UPDATE users SET login_id = name, is_approved = true WHERE login_id IS NULL")

    # 3. login_id를 non-nullable + unique로 변경
    op.alter_column("users", "login_id", nullable=False)
    op.create_unique_constraint("uq_users_login_id", "users", ["login_id"])

    # 4. pin_hash 컬럼 제거
    op.drop_column("users", "pin_hash")


def downgrade() -> None:
    op.add_column("users", sa.Column("pin_hash", sa.String(128), nullable=True))
    op.execute("UPDATE users SET pin_hash = password_hash")
    op.drop_constraint("uq_users_login_id", "users", type_="unique")
    op.drop_column("users", "is_approved")
    op.drop_column("users", "is_admin")
    op.drop_column("users", "password_hash")
    op.drop_column("users", "login_id")
