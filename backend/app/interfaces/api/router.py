from fastapi import APIRouter
from app.interfaces.api.routes import health, workflows

api_router = APIRouter()

# Include sub-routers
api_router.include_router(health.router)
api_router.include_router(workflows.router, prefix="/workflows")
