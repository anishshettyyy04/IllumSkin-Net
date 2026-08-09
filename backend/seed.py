import os
from models.productModel import init_db, insert_product

def seed_database():
    print("🌱 Initializing E-Commerce Database Schema...")
    init_db()
    
    # 15 Mock Foundation SKUs from real cosmetic brands
    products_to_seed = [
        ("Fenty Beauty", "Pro Filt'r Soft Matte Longwear Foundation", "100", "Foundation", "Neutral", [243, 224, 205], "#F3E0CD", True),
        ("Fenty Beauty", "Pro Filt'r Soft Matte Longwear Foundation", "220", "Foundation", "Warm Peach", [216, 167, 131], "#D8A783", True),
        ("Fenty Beauty", "Pro Filt'r Soft Matte Longwear Foundation", "300", "Foundation", "Warm Olive", [195, 139, 96], "#C38B60", True),
        ("Fenty Beauty", "Pro Filt'r Soft Matte Longwear Foundation", "420", "Foundation", "Neutral", [108, 62, 37], "#6C3E25", True),
        ("Fenty Beauty", "Pro Filt'r Soft Matte Longwear Foundation", "490", "Foundation", "Cool", [58, 30, 17], "#3A1E11", True),
        
        ("MAC", "Studio Fix Fluid SPF 15", "NC15", "Foundation", "Warm", [235, 203, 186], "#EBCBBA", True),
        ("MAC", "Studio Fix Fluid SPF 15", "NC30", "Foundation", "Warm", [201, 155, 119], "#C99B77", True),
        ("MAC", "Studio Fix Fluid SPF 15", "NW45", "Foundation", "Cool", [118, 69, 49], "#764531", True),
        
        ("NARS", "Light Reflecting Advanced Skincare Foundation", "Mont Blanc", "Foundation", "Cool", [240, 210, 194], "#F0D2C2", True),
        ("NARS", "Radiant Longwear Foundation", "Punjab", "Foundation", "Warm", [213, 166, 124], "#D5A67C", True),
        ("NARS", "Light Reflecting Advanced Skincare Foundation", "Tahoe", "Foundation", "Warm Caramel", [158, 100, 66], "#9E6442", True),
        
        ("Estée Lauder", "Double Wear Stay-in-Place Makeup", "1W1 Bone", "Foundation", "Warm", [226, 195, 165], "#E2C3A5", True),
        ("Estée Lauder", "Double Wear Stay-in-Place Makeup", "3W1 Tawny", "Foundation", "Warm", [198, 144, 110], "#C6906E", True),
        
        ("Maybelline", "Fit Me Matte + Poreless", "118 Light Beige", "Foundation", "Neutral", [232, 188, 160], "#E8BCA0", True),
        ("Maybelline", "Fit Me Matte + Poreless", "355 Coconut", "Foundation", "Cool", [93, 48, 30], "#5D301E", True),
    ]
    
    print(f"📦 Seeding {len(products_to_seed)} foundation SKUs...")
    for p in products_to_seed:
        insert_product(*p)
        print(f"   ✅ Added: {p[0]} - {p[1]} ({p[2]})")
        
    print("✨ Database seeding complete! You can now start the FastAPI server.")

if __name__ == "__main__":
    seed_database()
