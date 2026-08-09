import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.db.repositories.order_repository import OrderRepository
from app.schemas.common import APIResponse
from app.schemas.order import OrderCreatePayload, OrderRecord
from app.api.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

from app.models.product import Product

@router.post("", response_model=APIResponse[OrderRecord], status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreatePayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new e-commerce order."""
    email = current_user.email
    name = payload.name or current_user.username
    logger.info(f"Creating order for user: {email}")
    
    subtotal_usd = 0.0
    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.id).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product not found: {item.id}")
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail=f"Invalid quantity for product {item.id}")
        item.price = product.price
        subtotal_usd += product.price * item.quantity

    shipping_usd = 0.0 if subtotal_usd > 50 else 5.00
    ai_items = [item for item in payload.items if item.isAiRecommended]
    discount_usd = 0.0
    if len(ai_items) > 2:
        discount_usd = sum(item.price * item.quantity for item in ai_items) * 0.1
        
    total_usd = subtotal_usd + shipping_usd - discount_usd
    
    USD_TO_INR = 83.0
    subtotal_inr = round(subtotal_usd * USD_TO_INR, 2)
    shipping_inr = round(shipping_usd * USD_TO_INR, 2)
    discount_inr = round(discount_usd * USD_TO_INR, 2)
    total_inr = round(total_usd * USD_TO_INR, 2)

    repo = OrderRepository(db)
    try:
        db_order = repo.create_order(
            payload=payload,
            email=email,
            user_id=current_user.id,
            subtotal=subtotal_inr,
            shipping=shipping_inr,
            discount=discount_inr,
            total=total_inr,
            currency="INR",
            payment_method="COD"
        )
        record = repo.to_order_record(db_order)
        return APIResponse(
            success=True,
            data=record,
            message="Order placed successfully"
        )
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process order creation")

@router.get("/my", response_model=APIResponse[List[OrderRecord]])
def get_user_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all orders placed by the authenticated user."""
    user_id = current_user.id
    logger.info(f"Fetching orders for user_id: {user_id}")
    repo = OrderRepository(db)
    orders = repo.get_orders_by_user_id(user_id)
    records = [repo.to_order_record(o) for o in orders]
    return APIResponse(
        success=True,
        data=records,
        meta={"total": len(records)}
    )

@router.get("/{order_id}", response_model=APIResponse[OrderRecord])
def get_order(order_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve an order by its unique ID."""
    logger.info(f"Fetching order ID: {order_id}")
    repo = OrderRepository(db)
    db_order = repo.get_order_by_id(order_id)
    if not db_order or db_order.user_id != current_user.id:
        logger.warning(f"Order not found or unauthorized: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")
    
    record = repo.to_order_record(db_order)
    return APIResponse(
        success=True,
        data=record
    )
