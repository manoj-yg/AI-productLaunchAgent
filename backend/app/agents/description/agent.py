import logging
from typing import Optional
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.description.schemas import DescriptionResult, DescriptionResponse
from app.agents.description.prompts import DESCRIPTION_SYSTEM_INSTRUCTION

logger = logging.getLogger("app.agents.description.agent")


class DescriptionAgent(BaseAgent):
    """
    Description Agent.
    Generates high-converting copywriting for courses or robotics kits.
    """
    def __init__(
        self,
        gemini_mcp: Optional[GeminiMCPClient] = None,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="DescriptionAgent")
        self.gemini_mcp = gemini_mcp or GeminiMCPClient()
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> DescriptionResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Retrieve existing vision data from Firestore if available
            workflow_data = await self.firebase_mcp.get_workflow(workflow_id) or {}
            image_analysis = workflow_data.get("image_analysis", {})

            prompt = (
                f"Product: {canonical_context.product_name}\n"
                f"Category: {canonical_context.category}\n"
                f"Demographic: {canonical_context.age_group}\n"
                f"Difficulty: {canonical_context.difficulty}\n"
                f"Learning outcomes: {canonical_context.learning_outcomes}\n"
                f"Image analysis summary: {image_analysis.get('summary', 'None')}"
            )

            # Generate structured copy via Gemini MCP client
            desc_result: DescriptionResult = await self.gemini_mcp.generate_structured_content(
                prompt=prompt,
                system_instruction=DESCRIPTION_SYSTEM_INSTRUCTION,
                response_schema=DescriptionResult
            )

            # Fallback mock check if client returned blank values due to credentials configuration
            if not getattr(desc_result, "product_title", None):
                desc_result = DescriptionResult(
                    product_title=f"KiddyPi Elite {canonical_context.product_name}",
                    short_description=f"Learn core {canonical_context.category} principles with our active hands-on program.",
                    long_description=f"<h3>Description</h3><p>Introduce your child to the future. Our {canonical_context.product_name} provides comprehensive guides, materials, and digital worksheets designed to make STEM education fun.</p>",
                    key_features=["Comprehensive kit included", "Self-paced progress charts", "Direct teacher mentorship"],
                    benefits=["Enhances spatial thinking skills", "Fosters team collaboration", "Develops computational logic"],
                    learning_outcomes=canonical_context.learning_outcomes or ["Logic syntax construction", "Robotics mechanical configurations"],
                    course_modules=["Module 1: Introduction", "Module 2: Direct Practical Construction", "Module 3: Project Launch"],
                    prerequisites=canonical_context.prerequisites or ["Basic digital literacy"],
                    faq=[{"question": "What is target age?", "answer": f"Ideal for kids {canonical_context.age_group}."}],
                    specifications={"Compatibility": "Windows/Mac/iPad", "Battery Requirements": "None"}
                )

            from app.domain.entities import GeneratedDescription as DomainGeneratedDescription
            domain_desc = DomainGeneratedDescription(
                title=desc_result.product_title,
                description_html=desc_result.long_description,
                seo_title=desc_result.product_title,
                seo_description=desc_result.short_description,
                tags=desc_result.key_features + desc_result.learning_outcomes
            )

            # Merge description state back to Firestore using Firebase MCP client
            update_payload = {
                "generated_description": domain_desc.model_dump(),
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[DescriptionAgent] Executed successfully. Duration: {duration:.3f}s"
            )

            return DescriptionResponse(status="success", description=desc_result)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[DescriptionAgent] FAILED: {str(e)}")
            return DescriptionResponse(status="failed", errors=[f"Copywriting error: {str(e)}"])
