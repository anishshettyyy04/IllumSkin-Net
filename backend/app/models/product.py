from sqlalchemy import Column, Integer, String, Boolean, Float, Enum, JSON
import enum
from app.models.base import Base

class ProductCategory(str, enum.Enum):
    Foundation = "Foundation"
    Lipstick = "Lipstick"
    Blush = "Blush"
    Eye = "Eye"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    shade_name = Column(String, nullable=False)
    category = Column(Enum(ProductCategory), nullable=False)
    undertone = Column(String, nullable=False)
    true_rgb = Column(JSON, nullable=False)
    hex_code = Column(String, nullable=False)
    price = Column(Float, nullable=True)
    in_stock = Column(Boolean, default=True, nullable=False)
