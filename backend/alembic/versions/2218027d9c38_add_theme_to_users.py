"""add_theme_to_users

Revision ID: 2218027d9c38
Revises: 1d837d273940
Create Date: 2026-04-04 07:14:53.145074

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2218027d9c38'
down_revision: Union[str, Sequence[str], None] = '1d837d273940'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('theme', sa.String(10), server_default='dark', nullable=False))


def downgrade() -> None:
    op.drop_column('users', 'theme')
