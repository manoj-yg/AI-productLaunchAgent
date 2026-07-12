import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings, UPLOADS_DIR
from app.core.logging import setup_logging
from app.core.exceptions import register_exception_handlers
from app.core.middleware import RequestLoggingMiddleware
from app.core.firebase import FirebaseManager
from app.core.shopify import ShopifySessionManager
from app.interfaces.api.router import api_router

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Asynchronous lifespan manager handling startup initializers
    and shutdown resource cleanups.
    """
    logger.info("Initializing services during server boot...")
    
    # 1. Initialize Firebase Admin SDK connection
    FirebaseManager.initialize()
    
    # Seeding KiddyPi products in Firestore
    if FirebaseManager.db is not None:
        try:
            col_ref = FirebaseManager.db.collection("sample_products")
            docs = col_ref.limit(1).get()
            if not docs:
                from app.agents.recommendation.agent import SEED_PRODUCTS
                for p in SEED_PRODUCTS:
                    col_ref.document(p["product_id"]).set(p)
                logger.info("Successfully seeded 20 KiddyPi sample products in Firestore.")
        except Exception as e:
            logger.error(f"Failed to seed sample products in Firestore: {str(e)}")

    # 2. Activate Shopify API session configurations
    ShopifySessionManager.activate()
    
    yield
    
    logger.info("Deactivating services during server shutdown...")
    # Clean active Shopify sessions
    ShopifySessionManager.deactivate()


def create_app() -> FastAPI:
    """
    Application Factory Pattern.
    Constructs and configures the FastAPI application instance.
    """
    # Initialize structured logs
    setup_logging(log_level=settings.LOG_LEVEL, environment=settings.ENVIRONMENT)

    app = FastAPI(
        title="AI Product Launch Platform API",
        description="Modular Clean Architecture API orchestrating AI product catalog publications to Shopify.",
        version=settings.VERSION,
        lifespan=lifespan
    )

    # 1. CORS Middleware
    cors_origins = [str(origin) for origin in settings.CORS_ORIGINS]
    # Always allow local dev ports
    for port in ["5173", "5174", "5175", "3000"]:
        local = f"http://localhost:{port}"
        if local not in cors_origins:
            cors_origins.append(local)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Request Logging Middleware
    app.add_middleware(RequestLoggingMiddleware)

    # 3. Global exception handlers mapping
    register_exception_handlers(app)

    # 4. Routing register
    app.include_router(api_router, prefix="/api/v1")

    # 5. Serve uploaded product images as static files
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

    logger.info("FastAPI Application factory setup completed successfully.")
    return app


# Root reference for Uvicorn hot-reload runner
app = create_app()
