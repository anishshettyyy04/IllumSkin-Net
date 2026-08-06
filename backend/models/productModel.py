import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ecommerce.db")

def init_db():
    """Initializes the SQLite database with the Foundation SKU schema."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Drop table if exists to allow clean seeding
    cursor.execute('DROP TABLE IF EXISTS products')
    
    # Create the schema exactly as requested
    cursor.execute('''
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            productName TEXT NOT NULL,
            shadeName TEXT NOT NULL,
            category TEXT NOT NULL,
            undertone TEXT NOT NULL,
            trueRgbR REAL NOT NULL,
            trueRgbG REAL NOT NULL,
            trueRgbB REAL NOT NULL,
            hexCode TEXT NOT NULL,
            inStock BOOLEAN NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def insert_product(brand, productName, shadeName, category, undertone, rgb, hexCode, inStock):
    """Inserts a single foundation SKU into the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO products (brand, productName, shadeName, category, undertone, trueRgbR, trueRgbG, trueRgbB, hexCode, inStock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (brand, productName, shadeName, category, undertone, rgb[0], rgb[1], rgb[2], hexCode, inStock))
    conn.commit()
    conn.close()

def get_all_products():
    """Retrieves all foundation SKUs formatted as a list of dictionaries."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    rows = cursor.fetchall()
    conn.close()
    
    products = []
    for row in rows:
        # Map DB row to dictionary based on our schema layout
        products.append({
            "id": row[0],
            "brand": row[1],
            "name": f"{row[2]} {row[3]}", # e.g. "Pro Filt'r 100"
            "productName": row[2],
            "shadeName": row[3],
            "category": row[4],
            "undertone": row[5],
            "rgb": [row[6], row[7], row[8]],
            "hex": row[9],
            "inStock": bool(row[10])
        })
    return products
