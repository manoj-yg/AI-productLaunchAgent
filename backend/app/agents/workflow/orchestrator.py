import logging
import time
from typing import Dict, Any, Optional

from app.agents.base.agent import BaseAgent
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.agent import ProductIntakeAgent
from app.agents.product_intake.schemas import IntakeInput
from app.agents.image_analysis.agent import ImageAnalysisAgent
from app.agents.description.agent import DescriptionAgent
from app.agents.marketing.agent import MarketingAgent
from app.agents.image_prompt.agent import ImagePromptAgent
from app.agents.validation.agent import ValidationAgent

logger = logging.getLogger("app.agents.workflow.orchestrator")


class LaunchWorkflowAgent(BaseAgent):
    """
    Main Workflow Orchestrator Agent.
    Coordinates running the 6 distinct agents (Intake -> Vision -> Copywriting -> Marketing -> Prompts -> Validation).
    """
    def __init__(
        self,
        firebase_mcp: Optional[FirebaseMCPClient] = None,
        intake_agent: Optional[ProductIntakeAgent] = None,
        analysis_agent: Optional[ImageAnalysisAgent] = None,
        description_agent: Optional[DescriptionAgent] = None,
        marketing_agent: Optional[MarketingAgent] = None,
        prompt_agent: Optional[ImagePromptAgent] = None,
        validation_agent: Optional[ValidationAgent] = None
    ):
        super().__init__(name="LaunchWorkflowAgent")
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()
        self.intake_agent = intake_agent or ProductIntakeAgent(firebase_mcp=self.firebase_mcp)
        self.analysis_agent = analysis_agent or ImageAnalysisAgent(firebase_mcp=self.firebase_mcp)
        self.description_agent = description_agent or DescriptionAgent(firebase_mcp=self.firebase_mcp)
        self.marketing_agent = marketing_agent or MarketingAgent(firebase_mcp=self.firebase_mcp)
        self.prompt_agent = prompt_agent or ImagePromptAgent(firebase_mcp=self.firebase_mcp)
        self.validation_agent = validation_agent or ValidationAgent(firebase_mcp=self.firebase_mcp)

    async def execute_workflow(self, raw_input: IntakeInput) -> Dict[str, Any]:
        """
        Runs the full 6-stage product launch pipeline.
        Saves intermediate and final outputs in a single workflow document.
        Returns the finalized context for Human Review.
        """
        # Step 1: Product Intake
        intake_res = await self.intake_agent.run(raw_input)
        if intake_res.status == "failed" or not intake_res.canonical_context:
            return {
                "status": "failed",
                "errors": intake_res.errors,
                "workflow_id": "failed-at-intake"
            }

        canonical_ctx = intake_res.canonical_context
        workflow_id = canonical_ctx.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Step 2: Image Analysis (Vision)
            analysis_res = await self.analysis_agent.run(canonical_ctx)
            if analysis_res.status == "failed":
                logger.warning(f"Workflow {workflow_id} warning during Image Analysis: {analysis_res.errors}")

            # Step 3: Description Copywriting
            desc_res = await self.description_agent.run(canonical_ctx)
            if desc_res.status == "failed":
                logger.warning(f"Workflow {workflow_id} warning during Description copywriting: {desc_res.errors}")

            # Step 4: Marketing Content Generation
            marketing_res = await self.marketing_agent.run(canonical_ctx)
            if marketing_res.status == "failed":
                logger.warning(f"Workflow {workflow_id} warning during Marketing content: {marketing_res.errors}")

            # Step 5: Image Prompts Generation
            prompt_res = await self.prompt_agent.run(canonical_ctx)
            if prompt_res.status == "failed":
                logger.warning(f"Workflow {workflow_id} warning during Image Prompt creation: {prompt_res.errors}")

            # Step 6: Validation Audit
            val_res = await self.validation_agent.run(canonical_ctx)
            if val_res.status == "failed":
                logger.warning(f"Workflow {workflow_id} warning during Validation audit: {val_res.errors}")

            # Complete Orchestration lifecycle
            duration = self.log_end(workflow_id, start_time)
            
            # Transition workflow state to human_review
            canonical_ctx.status = "human_review"
            await self.firebase_mcp.save_workflow(workflow_id, {
                "canonical_context": canonical_ctx.model_dump(),
                "status": "human_review"
            })
            
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[LaunchWorkflowAgent] Complete multi-agent pipeline executed successfully. Duration: {duration:.3f}s"
            )

            # Query the single fully consolidated workflow document from Firestore
            final_document = await self.firebase_mcp.get_workflow(workflow_id) or {}
            
            # Append execution logs list directly to document response
            logs_record = await self.firebase_mcp.db.collection("workflow_logs").document(workflow_id).get() if self.firebase_mcp.db else None
            final_document["workflow_logs"] = logs_record.to_dict().get("logs", []) if logs_record and logs_record.exists else [
                f"Workflow initialized at intake",
                f"Complete multi-agent pipeline executed successfully. Duration: {duration:.3f}s"
            ]

            return {
                "status": "success",
                "workflow_id": workflow_id,
                "document": final_document
            }

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[LaunchWorkflowAgent] Pipeline FAILED: {str(e)}")
            return {
                "status": "failed",
                "workflow_id": workflow_id,
                "errors": [f"Pipeline execution failure: {str(e)}"]
            }
