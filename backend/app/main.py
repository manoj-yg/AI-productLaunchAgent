import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
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
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
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

    logger.info("FastAPI Application factory setup completed successfully.")
    return app


# Root reference for Uvicorn hot-reload runner
app = create_app()
