"""Initial schema for Better Auth

Revision ID: 52876f027f2d
Revises: 
Create Date: 2026-01-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # ADD THIS LINE

# revision identifiers, used by Alembic.
revision: str = '52876f027f2d'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create user table
    op.create_table(
        'user',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('email_verified', sa.Boolean(), nullable=False),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=False)

    # Create verification table
    op.create_table(
        'verification',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('identifier', sa.String(), nullable=False),
        sa.Column('value', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_verification_identifier'), 'verification', ['identifier'], unique=False)

    # Create account table
    op.create_table(
        'account',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('account_id', sa.String(), nullable=False),
        sa.Column('provider_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('access_token', sa.String(), nullable=True),
        sa.Column('refresh_token', sa.String(), nullable=True),
        sa.Column('id_token', sa.String(), nullable=True),
        sa.Column('access_token_expires_at', sa.DateTime(), nullable=True),
        sa.Column('refresh_token_expires_at', sa.DateTime(), nullable=True),
        sa.Column('scope', sa.String(), nullable=True),
        sa.Column('password', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_account_user_id'), 'account', ['user_id'], unique=False)

    # Create session table
    op.create_table(
        'session',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    op.create_index(op.f('ix_session_token'), 'session', ['token'], unique=False)
    op.create_index(op.f('ix_session_user_id'), 'session', ['user_id'], unique=False)

    # Create task table
    op.create_table(
        'task',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.String(), nullable=True, server_default='medium'),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_task_user_id'), 'task', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_task_user_id'), table_name='task')
    op.drop_table('task')
    op.drop_index(op.f('ix_session_user_id'), table_name='session')
    op.drop_index(op.f('ix_session_token'), table_name='session')
    op.drop_table('session')
    op.drop_index(op.f('ix_account_user_id'), table_name='account')
    op.drop_table('account')
    op.drop_index(op.f('ix_verification_identifier'), table_name='verification')
    op.drop_table('verification')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')