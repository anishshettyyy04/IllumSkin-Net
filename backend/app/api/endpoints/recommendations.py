import logging
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.db.repositories.product_repository import ProductRepository
from app.services.product_enrichment import ProductEnrichmentService
from app.schemas.common import APIResponse
from app.schemas.product import CompleteLookResponse
from app.models.product import ProductCategory

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/look", response_model=APIResponse[CompleteLookResponse])
def get_complete_look(
    foundation_id: int, 
    undertone: str,
    confidence: float = 95.0,
    db: Session = Depends(get_db)
):
    """
    Returns a 'Complete Look' bundle containing the AI-matched foundation 
    along with a complementary lipstick and blush based on the undertone.
    """
    logger.info(f"Generating Complete Look for foundation_id={foundation_id}, undertone={undertone}")
    repo = ProductRepository(db)
    
    foundation = repo.get_product_by_id(foundation_id)
    if not foundation:
        logger.error(f"Foundation not found: {foundation_id}")
        raise HTTPException(status_code=404, detail="Foundation not found")

    # Fetch complementary products
    lipsticks = repo.get_products_by_category(ProductCategory.Lipstick, limit=10)
    blushes = repo.get_products_by_category(ProductCategory.Blush, limit=10)
    
    # Simple mock logic for "complementary" based on undertone
    lipstick = lipsticks[0] if lipsticks else None
    blush = blushes[0] if blushes else None
    
    if undertone.lower() == "cool":
        lipstick = next((p for p in lipsticks if "cool" in p.undertone.lower()), lipsticks[0] if lipsticks else None)
        blush = next((p for p in blushes if "cool" in p.undertone.lower()), blushes[0] if blushes else None)
    elif undertone.lower() == "warm":
        lipstick = next((p for p in lipsticks if "warm" in p.undertone.lower()), lipsticks[-1] if lipsticks else None)
        blush = next((p for p in blushes if "warm" in p.undertone.lower()), blushes[-1] if blushes else None)

    # Enrich
    f_detail = ProductEnrichmentService.to_product_detail(foundation)
    l_detail = ProductEnrichmentService.to_product_detail(lipstick) if lipstick else None
    b_detail = ProductEnrichmentService.to_product_detail(blush) if blush else None

    look = CompleteLookResponse(
        foundation=f_detail,
        lipstick=l_detail,
        blush=b_detail,
        explanation=f"Based on your {undertone} undertone, we found a foundation that perfectly balances your complexion. We've paired it with complementary shades for a cohesive finish.",
        confidence=confidence,
        undertone=undertone
    )
    
    return APIResponse(
        success=True,
        data=look
    )
