from pydantic import BaseModel, Field
from typing import List

class MatchRequest(BaseModel):
    user_albedo: List[float] = Field(
        ..., 
        min_length=3, 
        max_length=3, 
        description="A list of 3 floats representing the user's RGB albedo (normalized 0.0 to 1.0)",
        example=[0.75, 0.55, 0.45]
    )

class ProductMatch(BaseModel):
    id: int
    brand: str
    product_name: str
    shade_name: str
    undertone: str
    hex_code: str
    price: float
    match_percentage: float

class MatchResponse(BaseModel):
    matches: List[ProductMatch]
