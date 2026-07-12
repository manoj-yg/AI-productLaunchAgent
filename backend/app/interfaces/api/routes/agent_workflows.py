import logging
from fastapi import APIRouter, HTTPException, status
from app.agents.product_intake.schemas import IntakeInput
from app.agents.workflow.orchestrator import LaunchWorkflowAgent

logger = logging.getLogger("app.api.agent_workflows")
router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def trigger_agent_workflow(payload: IntakeInput):
    """
    Triggers the multi-stage AI agent launch pipeline for educational products.
    Runs Intake -> Vision -> Description -> Marketing -> Image Prompts -> Validation
    and saves progress in a unified document.
    """
    try:
        orchestrator = LaunchWorkflowAgent()
        result = await orchestrator.execute_workflow(payload)
        
        if result["status"] == "failed":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"message": "Multi-agent pipeline failed to complete.", "errors": result.get("errors", [])}
            )
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error during multi-agent orchestration execution")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected internal error occurred: {str(e)}"
        )
