import time
import random
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.order import OrderCreatePayload, OrderRecord

from sqlalchemy import func

class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, payload: OrderCreatePayload) -> Order:
        # Generate unique order ID
        timestamp = int(time.time() * 1000)
        random_suffix = random.randint(100, 999)
        order_id = f"ORD-{timestamp}-{random_suffix}"
        
        # Convert Pydantic items to dicts
        items_dict = [item.dict() for item in payload.items]
        
        db_order = Order(
            id=order_id,
            email=payload.email,
            name=payload.name,
            items=items_dict,
            subtotal=payload.subtotal,
            shipping=payload.shipping,
            discount=payload.discount,
            total=payload.total,
            shipping_address=payload.shipping_address
        )
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_orders_by_user_email(self, email: str) -> List[Order]:
        return self.db.query(Order).filter(func.lower(Order.email) == email.lower()).order_by(Order.created_at.desc()).all()

    @staticmethod
    def to_order_record(order: Order) -> OrderRecord:
        date_str = order.created_at.strftime("%Y-%m-%d") if order.created_at else time.strftime("%Y-%m-%d")
        return OrderRecord(
            id=order.id,
            date=date_str,
            items=order.items,
            subtotal=order.subtotal,
            shipping=order.shipping,
            discount=order.discount,
            total=order.total,
            status="processing",
            shippingAddress=order.shipping_address,
            email=order.email,
            name=order.name
        )
