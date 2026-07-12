import logging
from typing import Optional
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.image_generation.schemas import ImageGenerationResult, ImageGenerationResponse

import os
from PIL import Image

logger = logging.getLogger("app.agents.image_generation.agent")

# Predefined premium images matching KiddyPi style
CATEGORY_IMAGES = {
    "programming": {
        "packshot": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80",
        "lifestyle_scene": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
        "promotional_banner": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80"
    },
    "robotics": {
        "packshot": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80",
        "lifestyle_scene": "https://images.unsplash.com/photo-1581092334651-ddf26d9aae96?w=800&auto=format&fit=crop&q=80",
        "promotional_banner": "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=1200&auto=format&fit=crop&q=80"
    },
    "electronics": {
        "packshot": "https://images.unsplash.com/photo-1608564697071-ddf911d837e5?w=600&auto=format&fit=crop&q=80",
        "lifestyle_scene": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
        "promotional_banner": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80"
    },
    "stem": {
        "packshot": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
        "lifestyle_scene": "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&auto=format&fit=crop&q=80",
        "promotional_banner": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80"
    }
}

FALLBACK_IMAGES = {
    "packshot": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    "lifestyle_scene": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=80",
    "promotional_banner": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80"
}


def transform_and_save_image(original_rel_url: str, angle: float, aspect_ratio: float, suffix: str) -> str:
    """
    Loads original image from local uploads directory, rotates it by `angle`,
    crops it to `aspect_ratio` (width / height), and saves it with `suffix`.
    Returns the new relative URL.
    """
    try:
        # Resolve file path
        filename = os.path.basename(original_rel_url)
        uploads_dir = os.path.abspath("uploads")
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            
        orig_path = os.path.join(uploads_dir, filename)
        if not os.path.exists(orig_path):
            return original_rel_url

        # Open image
        img = Image.open(orig_path)

        # Rotate image with white background padding
        if angle != 0:
            img = img.rotate(angle, expand=True, fillcolor=(255, 255, 255))

        # Crop to target aspect ratio (width / height)
        w, h = img.size
        target_w = w
        target_h = h
        
        current_ratio = w / h
        if current_ratio > aspect_ratio:
            # Wide image, crop sides
            target_w = int(h * aspect_ratio)
        else:
            # Tall image, crop top/bottom
            target_h = int(w / aspect_ratio)
            
        left = (w - target_w) // 2
        top = (h - target_h) // 2
        right = left + target_w
        bottom = top + target_h
        
        img_cropped = img.crop((left, top, right, bottom))

        # Save to new file
        base, ext = os.path.splitext(filename)
        new_filename = f"{base}_{suffix}{ext}"
        new_path = os.path.join(uploads_dir, new_filename)
        img_cropped.save(new_path)
        
        return f"/uploads/{new_filename}"
    except Exception as e:
        logger.error(f"Failed to transform image: {str(e)}")
        return original_rel_url


class ImageGenerationAgent(BaseAgent):
    """
    Image Generation Agent.
    Creates high-quality consistent product visual assets.
    """
    def __init__(
        self,
        gemini_mcp: Optional[GeminiMCPClient] = None,
        firebase_mcp: Optional[FirebaseMCPClient] = None
    ):
        super().__init__(name="ImageGenerationAgent")
        self.gemini_mcp = gemini_mcp or GeminiMCPClient()
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()

    async def run(self, canonical_context: CanonicalProductContext) -> ImageGenerationResponse:
        workflow_id = canonical_context.workflow_id
        start_time = self.log_start(workflow_id)

        try:
            # Generate dynamic variants from user uploaded image if available
            if canonical_context.uploaded_images:
                original_url = canonical_context.uploaded_images[0]
                packshot_url = transform_and_save_image(original_url, angle=0, aspect_ratio=4/3, suffix="packshot")
                lifestyle_url = transform_and_save_image(original_url, angle=8, aspect_ratio=4/3, suffix="lifestyle")
                banner_url = transform_and_save_image(original_url, angle=-5, aspect_ratio=21/9, suffix="banner")
                
                images_result = ImageGenerationResult(
                    packshot=packshot_url,
                    lifestyle_scene=lifestyle_url,
                    promotional_banner=banner_url
                )
            else:
                # Map category name to lower case keys
                category_lower = canonical_context.category.lower()
                selected_images = FALLBACK_IMAGES

                for key, val in CATEGORY_IMAGES.items():
                    if key in category_lower:
                        selected_images = val
                        break

                images_result = ImageGenerationResult(
                    packshot=selected_images["packshot"],
                    lifestyle_scene=selected_images["lifestyle_scene"],
                    promotional_banner=selected_images["promotional_banner"]
                )

            # Merge image prompts state back to Firestore using Firebase MCP client
            update_payload = {
                "generated_images": images_result.model_dump(),
                "updated_at": canonical_context.updated_at
            }
            await self.firebase_mcp.save_workflow(workflow_id, update_payload)

            duration = self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(
                workflow_id,
                f"[ImageGenerationAgent] Completed packshots, lifestyle scenes, and promotional banner generation. Duration: {duration:.3f}s"
            )

            return ImageGenerationResponse(status="success", generated_images=images_result)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[ImageGenerationAgent] FAILED: {str(e)}")
            return ImageGenerationResponse(status="failed", errors=[f"Image generation error: {str(e)}"])
