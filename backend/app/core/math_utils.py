import math
from typing import List

def calculate_color_distance(rgb1: List[float], rgb2: List[float]) -> float:
    """
    Calculates the 3D Euclidean distance between two RGB vectors.
    Assumes vectors are normalized between 0.0 and 1.0.
    """
    if len(rgb1) != 3 or len(rgb2) != 3:
        raise ValueError("RGB vectors must have exactly 3 components.")
    
    r_diff = rgb1[0] - rgb2[0]
    g_diff = rgb1[1] - rgb2[1]
    b_diff = rgb1[2] - rgb2[2]
    
    distance = math.sqrt(r_diff**2 + g_diff**2 + b_diff**2)
    return distance

def calculate_match_percentage(distance: float) -> float:
    """
    Converts a Euclidean distance to a match percentage (0% to 100%).
    The maximum possible distance in normalized RGB space is sqrt(1^2 + 1^2 + 1^2) = sqrt(3) ~= 1.732.
    """
    max_distance = math.sqrt(3)
    # Clamp distance to max_distance to avoid negative percentages
    distance = min(distance, max_distance)
    
    percentage = (1.0 - (distance / max_distance)) * 100.0
    return round(percentage, 2)
