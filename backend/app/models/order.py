from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.models.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    items = Column(JSON, nullable=False)
    subtotal = Column(Float, nullable=False)
    shipping = Column(Float, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    shipping_address = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, index=True, nullable=True)
    phone = Column(String, nullable=True)
    payment_method = Column(String, default="COD", nullable=True)
    currency = Column(String, default="INR", nullable=True)
    status = Column(String, default="placed", nullable=True)
