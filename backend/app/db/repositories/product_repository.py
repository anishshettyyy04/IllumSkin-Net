from sqlalchemy.orm import Session
from app.models.product import Product, ProductCategory
from typing import List, Optional

class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_products(self, category: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Product]:
        query = self.db.query(Product)
        if category:
            query = query.filter(Product.category == category)
        return query.offset(skip).limit(limit).all()

    def get_product_by_id(self, product_id: int) -> Optional[Product]:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def get_products_by_category(self, category: ProductCategory, limit: int = 10) -> List[Product]:
        return self.db.query(Product).filter(Product.category == category).limit(limit).all()
