from fastapi import APIRouter
from app.interfaces.api.routes import health, workflows, agent_workflows

api_router = APIRouter()

# Include sub-routers
api_router.include_router(health.router)
api_router.include_router(workflows.router, prefix="/workflows")
api_router.include_router(agent_workflows.router, prefix="/agent-workflows")
