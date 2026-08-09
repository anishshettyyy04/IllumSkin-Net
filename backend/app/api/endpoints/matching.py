from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.product import Product, ProductCategory
from app.schemas.common import APIResponse
from app.schemas.matching import MatchRequest, MatchResponse, ProductMatch
from app.core.math_utils import calculate_color_distance, calculate_match_percentage
from app.core.colorimetry import srgb_to_lab, delta_e_2000
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/match-shade", response_model=APIResponse[MatchResponse])
def match_shade(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Finds the top 3 closest foundation shades to the given user albedo using 3D Euclidean distance.
    """
    user_rgb = request.user_albedo
    
    # Query all foundation products
    products = db.query(Product).filter(Product.category == ProductCategory.Foundation).all()
    
    if not products:
        # Return empty list if database is empty
        return APIResponse(success=True, data=MatchResponse(matches=[]))
        
    scored_products = []
    
    # Calculate lab for user
    user_lab = srgb_to_lab(user_rgb)
    
    for product in products:
        try:
            distance = calculate_color_distance(user_rgb, product.true_rgb)
            match_percentage = calculate_match_percentage(distance)
            
            product_lab = srgb_to_lab(product.true_rgb)
            delta_e00 = delta_e_2000(user_lab, product_lab)
            
            logger.info(f"[MATCH:COLOR] userRGB={user_rgb} userLab={user_lab} productLab={product_lab} deltaE00={delta_e00}")
            
            scored_products.append({
                "product": product,
                "distance": distance,
                "match_percentage": match_percentage,
                "delta_e00": delta_e00
            })
        except ValueError:
            # Skip products with invalid RGB vectors
            continue
            
    # Sort by delta_e00 (lowest delta_e00 is closest match)
    scored_products.sort(key=lambda x: x["delta_e00"])
    
    # Get top 3
    top_3 = scored_products[:3]
    
    response_matches = []
    for item in top_3:
        p = item["product"]
        response_matches.append(
            ProductMatch(
                id=p.id,
                brand=p.brand,
                product_name=p.product_name,
                shade_name=p.shade_name,
                undertone=p.undertone,
                hex_code=p.hex_code,
                price=p.price,
                match_percentage=item["match_percentage"],
                delta_e00=item["delta_e00"]
            )
        )
        
    return APIResponse(
        success=True,
        data=MatchResponse(matches=response_matches)
    )

