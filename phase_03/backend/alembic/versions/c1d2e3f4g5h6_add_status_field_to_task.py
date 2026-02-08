"""Add status field to Task model

Revision ID: c1d2e3f4g5h6
Revises: 52876f027f2d
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4g5h6'
down_revision: Union[str, Sequence[str], None] = '52876f027f2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add status column to task table
    op.add_column('task', sa.Column('status', sa.String(), nullable=True))

    # Update existing tasks: set status based on is_completed/completed column
    # Note: The migration uses 'completed' (from old schema) or 'is_completed' (from new schema)
    op.execute("""
        UPDATE task
        SET status = CASE
            WHEN is_completed = true OR completed = true THEN 'completed'
            ELSE 'pending'
        END
        WHERE status IS NULL
    """)

    # Make status non-nullable with default after populating
    op.alter_column('task', 'status', nullable=False, existing_nullable=True, server_default='pending')

    # Add constraint on valid status values
    op.execute("""
        ALTER TABLE task
        ADD CONSTRAINT task_status_check
        CHECK (status IN ('pending', 'completed'))
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop constraint and column
    op.execute("ALTER TABLE task DROP CONSTRAINT task_status_check")
    op.drop_column('task', 'status')
