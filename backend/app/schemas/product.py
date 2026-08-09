from typing import List, Optional
from pydantic import BaseModel
from app.models.product import ProductCategory

class ProductReview(BaseModel):
    id: int
    user: str
    rating: int
    date: str
    comment: str

class ProductShade(BaseModel):
    id: str
    name: str
    hex: str

class ProductBase(BaseModel):
    id: int
    brand: str
    name: str
    price: float
    hex: str
    shade: str
    category: ProductCategory
    rating: float
    reviews: int
    discount: Optional[int] = None
    isAiCompatible: bool = False

class ProductDetail(ProductBase):
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    ingredients: Optional[str] = None
    usage: Optional[str] = None
    shades: Optional[List[ProductShade]] = None
    reviewsList: Optional[List[ProductReview]] = None
    images: Optional[List[str]] = None

class CompleteLookResponse(BaseModel):
    foundation: ProductDetail
    lipstick: Optional[ProductDetail] = None
    blush: Optional[ProductDetail] = None
    explanation: str
    confidence: float
    undertone: str
