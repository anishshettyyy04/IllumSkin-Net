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

    def create_order(self, payload: OrderCreatePayload, email: str, user_id: int, subtotal: float, shipping: float, discount: float, total: float, currency: str = "INR", payment_method: str = "COD") -> Order:
        # Generate unique order ID
        timestamp = int(time.time() * 1000)
        random_suffix = random.randint(100, 999)
        order_id = f"ORD-{timestamp}-{random_suffix}"
        
        # Convert Pydantic items to dicts
        items_dict = [item.dict() for item in payload.items]
        
        db_order = Order(
            id=order_id,
            user_id=user_id,
            email=email,
            name=payload.name,
            phone=payload.phone,
            items=items_dict,
            subtotal=subtotal,
            shipping=shipping,
            discount=discount,
            total=total,
            shipping_address=payload.shipping_address,
            currency=currency,
            payment_method=payment_method,
            status="placed"
        )
        self.db.add(db_order)
        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def get_order_by_id(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_orders_by_user_id(self, user_id: int) -> List[Order]:
        return self.db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

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
            status=order.status or "placed",
            shippingAddress=order.shipping_address,
            email=order.email,
            name=order.name,
            phone=order.phone,
            paymentMethod=order.payment_method or "COD",
            currency=order.currency or "INR"
        )
