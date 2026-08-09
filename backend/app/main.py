from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.base import Base
import app.models  # Ensure all models are imported before create_all
from app.api.endpoints import matching, products, recommendations, orders, auth

# Auto-create tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IllumSkin-Net API",
    description="Backend API for the IllumSkin-Net E-Commerce Platform",
    version="1.0.0"
)

import os

# Configure CORS for frontend access
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matching.router, prefix="/api", tags=["matching"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(recommendations.router, prefix="/api/matching", tags=["recommendations"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/api/health")
def health_check():
    return {
        "success": True,
        "message": "IllumSkin-Net Backend API is running",
        "version": "1.0.0"
    }

