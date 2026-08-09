import random
from typing import List, Dict, Any
from app.models.product import Product
from app.schemas.product import ProductBase, ProductDetail, ProductShade, ProductReview

class ProductEnrichmentService:
    """
    Enriches basic Product models from the database with dynamic metadata
    (descriptions, ingredients, mock reviews) required for the e-commerce UI
    without altering the core schema.
    """
    
    @staticmethod
    def _generate_mock_reviews() -> List[ProductReview]:
        return [
            ProductReview(id=1, user="Jane D.", rating=5, date="1 month ago", comment="Absolutely love the finish. Matches perfectly!"),
            ProductReview(id=2, user="Sarah M.", rating=4, date="3 weeks ago", comment="Great product, just wish it lasted a bit longer on oily skin.")
        ]
        
    @staticmethod
    def _generate_mock_shades(product: Product) -> List[ProductShade]:
        # Generate some mock shades around the product's actual shade
        return [
            ProductShade(id=f"sh_{product.id}_1", name=product.shade_name, hex=product.hex_code),
            ProductShade(id=f"sh_{product.id}_2", name=f"{product.shade_name} Light", hex="#F3E5AB"),
            ProductShade(id=f"sh_{product.id}_3", name=f"{product.shade_name} Deep", hex="#8B5A2B")
        ]

    @staticmethod
    def to_product_base(product: Product) -> ProductBase:
        # Mock rating and reviews count for UI based on product ID to keep it consistent
        random.seed(product.id)
        rating = round(random.uniform(3.8, 5.0), 1)
        reviews = random.randint(10, 500)
        
        return ProductBase(
            id=product.id,
            brand=product.brand,
            name=product.product_name,
            price=product.price or 45.0,
            hex=product.hex_code,
            shade=product.shade_name,
            category=product.category,
            rating=rating,
            reviews=reviews,
            isAiCompatible=product.category.value == "Foundation"
        )
        
    @staticmethod
    def to_product_detail(product: Product) -> ProductDetail:
        base = ProductEnrichmentService.to_product_base(product)
        
        return ProductDetail(
            **base.dict(),
            description=f"A premium {product.category.value.lower()} from {product.brand} designed to complement your natural undertones.",
            highlights=["Long-lasting wear", "Skin-balancing formula", "Cruelty-free"],
            ingredients="Water/Aqua/Eau, Cyclopentasiloxane, Titanium Dioxide, Dimethicone, ...",
            usage="Apply evenly across the desired area and blend.",
            shades=ProductEnrichmentService._generate_mock_shades(product),
            reviewsList=ProductEnrichmentService._generate_mock_reviews(),
            images=["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"]
        )
