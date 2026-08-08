import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.repositories.order_repository import OrderRepository
from app.schemas.common import APIResponse
from app.schemas.order import OrderCreatePayload, OrderRecord

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("", response_model=APIResponse[OrderRecord], status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreatePayload, db: Session = Depends(get_db)):
    """Create a new e-commerce order."""
    logger.info(f"Creating order for user: {payload.email}")
    repo = OrderRepository(db)
    try:
        db_order = repo.create_order(payload)
        record = repo.to_order_record(db_order)
        return APIResponse(
            success=True,
            data=record,
            message="Order placed successfully"
        )
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process order creation")

@router.get("/user/{email}", response_model=APIResponse[List[OrderRecord]])
def get_user_orders(email: str, db: Session = Depends(get_db)):
    """Retrieve all orders placed by a specific user email."""
    logger.info(f"Fetching orders for email: {email}")
    repo = OrderRepository(db)
    orders = repo.get_orders_by_user_email(email)
    records = [repo.to_order_record(o) for o in orders]
    return APIResponse(
        success=True,
        data=records,
        meta={"total": len(records)}
    )

@router.get("/{order_id}", response_model=APIResponse[OrderRecord])
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Retrieve an order by its unique ID."""
    logger.info(f"Fetching order ID: {order_id}")
    repo = OrderRepository(db)
    db_order = repo.get_order_by_id(order_id)
    if not db_order:
        logger.warning(f"Order not found: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")
    
    record = repo.to_order_record(db_order)
    return APIResponse(
        success=True,
        data=record
    )
