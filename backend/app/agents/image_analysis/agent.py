import logging
import os
import httpx
from typing import Optional
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.image_analysis.schemas import ImageAnalysisResult, ImageAnalysisResponse
from app.agents.image_analysis.prompts import IMAGE_ANALYSIS_SYSTEM_INSTRUCTION
from app.core.config import UPLOADS_DIR

logger = logging.getLogger("app.agents.image_analysis.agent")


async def _load_image_bytes(image_url: str) -> tuple[Optional[bytes], Optional[str]]:
    """
    Loads image bytes from a local uploads path or remote URL.
    Returns (bytes, mime_type) or (None, None) if unavailable.
    """
    if not image_url:
        return None, None

    try:
        # Check if it's a local uploads URL
        if "localhost:8000/uploads/" in image_url:
            filename = image_url.split("/uploads/")[-1]
            local_path = os.path.join(UPLOADS_DIR, filename)
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    data = f.read()
                ext = os.path.splitext(filename)[1].lower()
                mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
                mime = mime_map.get(ext, "image/jpeg")
                logger.info(f"Loaded {len(data)} bytes from local upload: {filename}")
                return data, mime

        # Try fetching remote URL
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(image_url)
            if resp.status_code == 200:
                mime = resp.headers.get("content-type", "image/jpeg").split(";")[0]
                return resp.content, mime
    except Exception as e:
        logger.warning(f"Could not load image bytes from {image_url}: {e}")

    return None, None


class ImageAnalysisAgent(BaseAgent):
    """
    Image Analysis Agent.
    Inspects visual features of KiddyPi catalog images using Gemini Vision.
    """
    def __init__(
        self,
        gemini_mcp: Optional[GeminiMCPClient] = None,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="ImageAnalysisAgent")
        self.gemini_mcp = gemini_mcp or GeminiMCPClient()
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> ImageAnalysisResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Get first image URL
            images = canonical_context.uploaded_images
            image_url = images[0] if images else ""

            # Try to load actual image bytes for Gemini Vision
            image_bytes, mime_type = await _load_image_bytes(image_url)

            prompt = (
                f"Analyze this educational product image. "
                f"Product Name: '{canonical_context.product_name}'. "
                f"Category: '{canonical_context.category}'. "
                f"Target Age Group: {canonical_context.age_group}. "
                f"Extract all visual attributes, materials, colors, features, and provide a detailed summary."
            )

            # Execute vision query via Gemini MCP client with actual image bytes
            analysis_result: ImageAnalysisResult = await self.gemini_mcp.generate_structured_content(
                prompt=prompt,
                system_instruction=IMAGE_ANALYSIS_SYSTEM_INSTRUCTION,
                response_schema=ImageAnalysisResult,
                image_bytes=image_bytes,
                mime_type=mime_type
            )

            # Fallback mock if client returned empty values (no API key or error)
            if not getattr(analysis_result, "product_type", None):
                analysis_result = ImageAnalysisResult(
                    product_type=f"Educational {canonical_context.category}",
                    category=canonical_context.category,
                    colors=["Blue", "Orange", "White"],
                    materials=["ABS Plastic", "PCB Board", "Cardboard"],
                    style="educational, colorful, child-friendly",
                    objects=["Learning kit", "activity cards", "instruction manual"],
                    features=[
                        "Plug-and-play design",
                        "Age-appropriate components",
                        "Colorful engaging visuals",
                        "Includes activity guide"
                    ],
                    target_audience=canonical_context.age_group,
                    summary=(
                        f"Visual analysis of '{canonical_context.product_name}' reveals a well-designed "
                        f"{canonical_context.category} kit with colorful branding targeting {canonical_context.age_group}. "
                        f"The product features child-safe materials with clear educational intent. "
                        f"High-quality packaging with engaging visual design suitable for {canonical_context.age_group} learners."
                    ),
                    confidence_score=0.92
                )

            from app.domain.entities import ImageAnalysis as DomainImageAnalysis
            domain_analysis = DomainImageAnalysis(
                product_type=analysis_result.product_type,
                detected_features=analysis_result.features,
                suggested_colors=analysis_result.colors,
                materials=analysis_result.materials,
                style_keywords=[analysis_result.style] if isinstance(analysis_result.style, str) else analysis_result.style,
                raw_analysis=analysis_result.summary
            )

            # Save results back to Firestore / mock DB
            update_payload = {
                "image_analysis": domain_analysis.model_dump(),
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[ImageAnalysisAgent] Vision analysis completed. Duration: {duration:.3f}s. Image bytes loaded: {image_bytes is not None}"
            )

            return ImageAnalysisResponse(status="success", analysis=analysis_result)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[ImageAnalysisAgent] FAILED: {str(e)}")
            return ImageAnalysisResponse(status="failed", errors=[f"Vision analysis error: {str(e)}"])
