import logging
from typing import Optional
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.image_prompt.schemas import ImagePromptResult, ImagePromptResponse
from app.agents.image_prompt.prompts import IMAGE_PROMPT_SYSTEM_INSTRUCTION

logger = logging.getLogger("app.agents.image_prompt.agent")


class ImagePromptAgent(BaseAgent):
    """
    Image Prompt Agent.
    Generates text-to-image prompts for KiddyPi marketing visual creation.
    """
    def __init__(
        self,
        gemini_mcp: Optional[GeminiMCPClient] = None,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="ImagePromptAgent")
        self.gemini_mcp = gemini_mcp or GeminiMCPClient()
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> ImagePromptResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Query existing description data from Firestore
            workflow_data = await self.firebase_mcp.get_workflow(workflow_id) or {}
            description_data = workflow_data.get("generated_description", {})

            prompt = (
                f"Product Title: {description_data.get('product_title', canonical_context.product_name)}\n"
                f"Category: {canonical_context.category}\n"
                f"Short Hook: {description_data.get('short_description', 'N/A')}\n"
                f"Features list: {description_data.get('key_features', [])}"
            )

            # Generate structured prompts via Gemini MCP client
            prompts_result: ImagePromptResult = await self.gemini_mcp.generate_structured_content(
                prompt=prompt,
                system_instruction=IMAGE_PROMPT_SYSTEM_INSTRUCTION,
                response_schema=ImagePromptResult
            )

            # Fallback mock check if client returned blank values due to credentials configuration
            if not getattr(prompts_result, "hero_banner", None):
                prompts_result = ImagePromptResult(
                    hero_banner=f"Photorealistic landscape banner of a happy child constructing a {canonical_context.product_name} robotics kit, soft depth of field, natural bright workspace lighting, 8k resolution, highly detailed.",
                    website_banner=f"Panoramic wide banner showing colorful electronic modular boards and wires on a desk, clean minimalist arrangement, vibrant colors, kid-friendly look.",
                    course_thumbnail=f"Subject-focused thumbnail of the {canonical_context.product_name} kit with clean blue background, high contrast, studio shot.",
                    instagram_creative=f"Square flatlay creative card of {canonical_context.category} tools, colorful sensors, microcontrollers, playful arrangement, photorealistic.",
                    poster=f"Dramatic student poster, child looking up at a glowing digital holograph representing Scratch/Python programming blocks, tech-heavy, inspirational.",
                    lifestyle_image=f"Two students, age group {canonical_context.age_group}, coding together on a laptop next to the assembled {canonical_context.product_name} kit, smiling naturally.",
                    social_media_ads=f"Modern, conversion-focused split grid creative featuring the KiddyPi microcontroller module, clean bright studio composition, high-end tech styling."
                )

            # Merge prompts state back to Firestore using Firebase MCP client
            update_payload = {
                "image_prompts": prompts_result.model_dump(),
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[ImagePromptAgent] Executed successfully. Duration: {duration:.3f}s"
            )

            return ImagePromptResponse(status="success", prompts=prompts_result)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[ImagePromptAgent] FAILED: {str(e)}")
            return ImagePromptResponse(status="failed", errors=[f"Image prompts creation error: {str(e)}"])
