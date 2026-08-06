from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.product import Product, ProductCategory
from app.models.base import Base

def get_mock_products():
    return [
        {
            "brand": "Fenty Beauty",
            "product_name": "Pro Filt'r Soft Matte",
            "shade_name": "100",
            "category": ProductCategory.Foundation,
            "undertone": "Neutral",
            "true_rgb": [0.93, 0.85, 0.77],
            "hex_code": "#EED8C4",
            "price": 40.0,
            "in_stock": True,
        },
        {
            "brand": "Fenty Beauty",
            "product_name": "Pro Filt'r Soft Matte",
            "shade_name": "110",
            "category": ProductCategory.Foundation,
            "undertone": "Cool",
            "true_rgb": [0.94, 0.82, 0.78],
            "hex_code": "#F0D1C7",
            "price": 40.0,
            "in_stock": True,
        },
        {
            "brand": "Fenty Beauty",
            "product_name": "Pro Filt'r Soft Matte",
            "shade_name": "290",
            "category": ProductCategory.Foundation,
            "undertone": "Warm Olive",
            "true_rgb": [0.77, 0.58, 0.40],
            "hex_code": "#C49466",
            "price": 40.0,
            "in_stock": True,
        },
        {
            "brand": "Fenty Beauty",
            "product_name": "Pro Filt'r Soft Matte",
            "shade_name": "420",
            "category": ProductCategory.Foundation,
            "undertone": "Warm",
            "true_rgb": [0.45, 0.28, 0.18],
            "hex_code": "#73472E",
            "price": 40.0,
            "in_stock": True,
        },
        {
            "brand": "Fenty Beauty",
            "product_name": "Pro Filt'r Soft Matte",
            "shade_name": "490",
            "category": ProductCategory.Foundation,
            "undertone": "Cool",
            "true_rgb": [0.24, 0.15, 0.12],
            "hex_code": "#3D261F",
            "price": 40.0,
            "in_stock": True,
        },
        {
            "brand": "MAC",
            "product_name": "Studio Fix Fluid",
            "shade_name": "NC15",
            "category": ProductCategory.Foundation,
            "undertone": "Warm",
            "true_rgb": [0.89, 0.75, 0.62],
            "hex_code": "#E3C09E",
            "price": 39.0,
            "in_stock": True,
        },
        {
            "brand": "MAC",
            "product_name": "Studio Fix Fluid",
            "shade_name": "NW20",
            "category": ProductCategory.Foundation,
            "undertone": "Cool",
            "true_rgb": [0.86, 0.70, 0.61],
            "hex_code": "#DBB39B",
            "price": 39.0,
            "in_stock": True,
        },
        {
            "brand": "MAC",
            "product_name": "Studio Fix Fluid",
            "shade_name": "NC45",
            "category": ProductCategory.Foundation,
            "undertone": "Warm",
            "true_rgb": [0.55, 0.35, 0.22],
            "hex_code": "#8C5938",
            "price": 39.0,
            "in_stock": True,
        },
        {
            "brand": "MAC",
            "product_name": "Studio Fix Fluid",
            "shade_name": "NW50",
            "category": ProductCategory.Foundation,
            "undertone": "Cool",
            "true_rgb": [0.35, 0.21, 0.16],
            "hex_code": "#593629",
            "price": 39.0,
            "in_stock": True,
        },
        {
            "brand": "Maybelline",
            "product_name": "Fit Me Matte + Poreless",
            "shade_name": "110 Porcelain",
            "category": ProductCategory.Foundation,
            "undertone": "Cool",
            "true_rgb": [0.93, 0.81, 0.75],
            "hex_code": "#EDCFC0",
            "price": 8.99,
            "in_stock": True,
        },
        {
            "brand": "Maybelline",
            "product_name": "Fit Me Matte + Poreless",
            "shade_name": "128 Warm Nude",
            "category": ProductCategory.Foundation,
            "undertone": "Warm",
            "true_rgb": [0.86, 0.72, 0.58],
            "hex_code": "#DBB894",
            "price": 8.99,
            "in_stock": True,
        },
        {
            "brand": "Maybelline",
            "product_name": "Fit Me Matte + Poreless",
            "shade_name": "220 Natural Beige",
            "category": ProductCategory.Foundation,
            "undertone": "Neutral",
            "true_rgb": [0.80, 0.62, 0.49],
            "hex_code": "#CC9E7D",
            "price": 8.99,
            "in_stock": True,
        },
        {
            "brand": "Maybelline",
            "product_name": "Fit Me Matte + Poreless",
            "shade_name": "330 Toffee",
            "category": ProductCategory.Foundation,
            "undertone": "Warm",
            "true_rgb": [0.60, 0.40, 0.26],
            "hex_code": "#996642",
            "price": 8.99,
            "in_stock": True,
        },
        {
            "brand": "Maybelline",
            "product_name": "Fit Me Matte + Poreless",
            "shade_name": "355 Pecan",
            "category": ProductCategory.Foundation,
            "undertone": "Neutral",
            "true_rgb": [0.42, 0.25, 0.17],
            "hex_code": "#6B402B",
            "price": 8.99,
            "in_stock": True,
        },
        {
            "brand": "Maybelline",
            "product_name": "Fit Me Matte + Poreless",
            "shade_name": "360 Mocha",
            "category": ProductCategory.Foundation,
            "undertone": "Cool",
            "true_rgb": [0.30, 0.18, 0.14],
            "hex_code": "#4D2E24",
            "price": 8.99,
            "in_stock": True,
        }
    ]

def seed_database():
    print("Seeding database...")
    db: Session = SessionLocal()
    try:
        # Wipe the table to avoid duplicates
        db.query(Product).delete()
        db.commit()
        print("Existing products cleared.")

        products = get_mock_products()
        for prod_data in products:
            product = Product(**prod_data)
            db.add(product)
        
        db.commit()
        print(f"Successfully seeded {len(products)} foundation shades!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
