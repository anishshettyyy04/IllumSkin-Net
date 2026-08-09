"""add_commerce_fields_to_orders

Revision ID: b4d1d8479a97
Revises: initial_001
Create Date: 2026-08-09 16:46:57.725297

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4d1d8479a97'
down_revision: Union[str, None] = 'initial_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('phone', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('payment_method', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('currency', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(), nullable=True))
        batch_op.create_foreign_key('fk_orders_user_id', 'users', ['user_id'], ['id'])

def downgrade() -> None:
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_constraint('fk_orders_user_id', type_='foreignkey')
        batch_op.drop_column('status')
        batch_op.drop_column('currency')
        batch_op.drop_column('payment_method')
        batch_op.drop_column('phone')
        batch_op.drop_column('user_id')
