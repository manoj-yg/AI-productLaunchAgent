import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.interfaces.api.routes import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("main")

app = FastAPI(
    title="AI Product Launch Platform API",
    description="Backend services for analyzing, generating, and launching digital products to Shopify.",
    version="1.0.0",
)

# Set up CORS middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include main API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    """
    Standard health check endpoint.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "services": {
            "firebase": "initialized_placeholder",
            "shopify": "configured_placeholder",
            "gemini": "configured_placeholder"
        }
    }
