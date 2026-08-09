from typing import List, Optional, Any
from pydantic import BaseModel

class CartItemSchema(BaseModel):
    id: int
    brand: str
    name: str
    price: float
    hex: str
    shade: str
    category: str
    rating: float
    reviews: int
    isAiCompatible: Optional[bool] = False
    quantity: int
    isAiRecommended: Optional[bool] = False
    bundleId: Optional[str] = None

class OrderCreatePayload(BaseModel):
    items: List[CartItemSchema]
    subtotal: float
    shipping: float
    discount: float = 0.0
    total: float
    shipping_address: str
    email: str
    name: str

class OrderRecord(BaseModel):
    id: str
    date: str
    items: List[dict]
    subtotal: float
    shipping: float
    discount: float
    total: float
    status: str
    shippingAddress: str
    email: str
    name: str
