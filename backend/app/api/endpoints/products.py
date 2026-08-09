import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.db.repositories.product_repository import ProductRepository
from app.services.product_enrichment import ProductEnrichmentService
from app.schemas.common import APIResponse
from app.schemas.product import ProductBase, ProductDetail

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("", response_model=APIResponse[List[ProductBase]])
def get_products(category: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve all products, optionally filtered by category."""
    logger.info(f"Fetching products (category={category}, skip={skip}, limit={limit})")
    repo = ProductRepository(db)
    products = repo.get_all_products(category=category, skip=skip, limit=limit)
    
    enriched_products = [ProductEnrichmentService.to_product_base(p) for p in products]
    
    return APIResponse(
        success=True,
        data=enriched_products,
        meta={"total": len(enriched_products), "skip": skip, "limit": limit}
    )

@router.get("/{product_id}", response_model=APIResponse[ProductDetail])
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Retrieve a detailed product by ID."""
    logger.info(f"Fetching product details for ID: {product_id}")
    repo = ProductRepository(db)
    product = repo.get_product_by_id(product_id)
    
    if not product:
        logger.warning(f"Product not found: {product_id}")
        raise HTTPException(status_code=404, detail="Product not found")
        
    enriched = ProductEnrichmentService.to_product_detail(product)
    
    return APIResponse(
        success=True,
        data=enriched
    )
