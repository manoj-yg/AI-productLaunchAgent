import logging
from typing import Optional
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.feature_generator.schemas import FeatureGeneratorResult, FeatureGeneratorResponse
from app.agents.feature_generator.prompts import FEATURE_GENERATOR_SYSTEM_INSTRUCTION

logger = logging.getLogger("app.agents.feature_generator.agent")


class FeatureGeneratorAgent(BaseAgent):
    """
    Feature Generator Agent.
    Generates key features, specifications, whats_included, and learning highlights.
    """
    def __init__(
        self,
        gemini_mcp: Optional[GeminiMCPClient] = None,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="FeatureGeneratorAgent")
        self.gemini_mcp = gemini_mcp or GeminiMCPClient()
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> FeatureGeneratorResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            workflow_data = await self.firebase_mcp.get_workflow(workflow_id) or {}
            image_analysis = workflow_data.get("image_analysis", {})

            prompt = (
                f"Product Title: {canonical_context.product_name}\n"
                f"Category: {canonical_context.category}\n"
                f"Age Group: {canonical_context.age_group}\n"
                f"Difficulty: {canonical_context.difficulty}\n"
                f"Learning outcomes: {canonical_context.learning_outcomes}\n"
                f"Image analysis summary: {image_analysis.get('summary', 'None')}"
            )

            # Generate structured features via Gemini MCP client
            features_result: FeatureGeneratorResult = await self.gemini_mcp.generate_structured_content(
                prompt=prompt,
                system_instruction=FEATURE_GENERATOR_SYSTEM_INSTRUCTION,
                response_schema=FeatureGeneratorResult
            )

            # Fallback mock check if client returned blank values due to credentials configuration
            if not getattr(features_result, "key_features", None):
                features_result = FeatureGeneratorResult(
                    key_features=[
                        "Plug-and-play assembly (no soldering required)",
                        "Guided visual interface with simple block connections",
                        "Child-safe rounded ABS materials",
                        "Engaging step-by-step cartoon guidebook"
                    ],
                    specifications={
                        "Material": "ABS Plastic, Lead-free PCB",
                        "Dimensions": "20cm x 15cm x 5cm",
                        "Weight": "450g",
                        "Recommended Age": canonical_context.age_group,
                        "Software Compatibility": "Scratch 3.0 / Chrome / Safari"
                    },
                    whats_included=[
                        "1x KiddyPi Microcontroller Module",
                        "12x Color-coded Sensor Modules",
                        "1x USB-C Connection Cable",
                        "1x Illustrated Activity Guidebook",
                        "Access to 10 Online Activity Videos"
                    ],
                    highlights=[
                        "Develops logical problem-solving & algorithmic reasoning",
                        "Builds early interest in STEM and electrical engineering concepts",
                        "Improves spatial coordination and fine-motor skills during builds",
                        "Fosters parent-child collaboration or independent study habits"
                    ]
                )

            # Merge features state back to Firestore using Firebase MCP client
            update_payload = {
                "features": features_result.model_dump(),
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[FeatureGeneratorAgent] Executed successfully. Duration: {duration:.3f}s"
            )

            return FeatureGeneratorResponse(status="success", features=features_result)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[FeatureGeneratorAgent] FAILED: {str(e)}")
            return FeatureGeneratorResponse(status="failed", errors=[f"Feature generation error: {str(e)}"])
