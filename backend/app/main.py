from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import matching, products, recommendations

app = FastAPI(
    title="IllumSkin-Net API",
    description="Backend API for the IllumSkin-Net E-Commerce Platform",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev; adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matching.router, prefix="/api", tags=["matching"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(recommendations.router, prefix="/api/matching", tags=["recommendations"])

@app.get("/api/health")
def health_check():
    return {
        "success": True,
        "message": "IllumSkin-Net Backend API is running",
        "version": "1.0.0"
    }
