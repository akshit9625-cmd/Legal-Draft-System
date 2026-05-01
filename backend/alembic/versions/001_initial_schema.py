"""Initial schema — users, cases, drafts

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=True),
        sa.Column('role', sa.String(50), nullable=False, server_default='advocate'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    op.create_table(
        'cases',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('jurisdiction', sa.String(200), nullable=True),
        sa.Column('petitioner_name', sa.String(300), nullable=True),
        sa.Column('respondent_name', sa.String(300), nullable=True),
        sa.Column('incident_date', sa.String(50), nullable=True),
        sa.Column('case_description', sa.Text(), nullable=False),
        sa.Column('sections_alleged', sa.String(500), nullable=True),
        sa.Column('relief_sought', sa.Text(), nullable=True),
        sa.Column('case_type', sa.String(100), nullable=True),
        sa.Column('case_type_confidence', sa.Float(), nullable=True),
        sa.Column('extracted_entities', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_cases_user_id', 'cases', ['user_id'])
    op.create_index('ix_cases_status', 'cases', ['status'])

    op.create_table(
        'drafts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=False),
        sa.Column('sections', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('full_text', sa.Text(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('model_used', sa.String(100), nullable=True),
        sa.Column('generation_time_seconds', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('case_id'),
    )


def downgrade() -> None:
    op.drop_table('drafts')
    op.drop_index('ix_cases_status', 'cases')
    op.drop_index('ix_cases_user_id', 'cases')
    op.drop_table('cases')
    op.drop_index('ix_users_username', 'users')
    op.drop_index('ix_users_email', 'users')
    op.drop_table('users')
