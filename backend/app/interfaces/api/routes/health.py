import logging
from fastapi import APIRouter, status
from app.core.config import settings

logger = logging.getLogger("app.health")
router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check():
    """
    Detailed health check. Validates the existence of critical environment variables
    for Firebase, Shopify, and Google Gen AI API configurations.
    """
    logger.info("Executing detailed system health audit...")
    
    # Check credentials parameters configurations presence
    firebase_configured = bool(settings.FIREBASE_PROJECT_ID and settings.FIREBASE_STORAGE_BUCKET)
    shopify_configured = bool(settings.SHOPIFY_SHOP_URL and settings.SHOPIFY_ADMIN_API_ACCESS_TOKEN)
    gemini_configured = bool(settings.GEMINI_API_KEY)
    
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "configurations": {
            "firebase_admin_sdk": {
                "active": firebase_configured,
                "project_id_configured": bool(settings.FIREBASE_PROJECT_ID)
            },
            "shopify_admin_sdk": {
                "active": shopify_configured,
                "shop_domain_configured": bool(settings.SHOPIFY_SHOP_URL)
            },
            "google_genai_sdk": {
                "active": gemini_configured,
                "model_version": settings.GEMINI_MODEL
            }
        }
    }


@router.get("/version", tags=["System"])
async def get_version():
    """
    Returns application system version.
    """
    return {
        "title": "AI Product Launch Platform API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
