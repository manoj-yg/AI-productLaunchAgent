import logging
from typing import Optional
import os
import httpx
from PIL import Image
from app.agents.base.agent import BaseAgent
from app.agents.mcp.gemini_mcp import GeminiMCPClient
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.product_intake.schemas import CanonicalProductContext
from app.agents.image_generation.schemas import ImageGenerationResult, ImageGenerationResponse
from app.core.config import UPLOADS_DIR

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


async def ensure_local_image(image_url: str) -> Optional[str]:
    """
    Ensures the image exists locally in UPLOADS_DIR.
    If it's a remote URL, downloads it and saves it.
    Returns the local filename or None if download fails.
    """
    if not image_url:
        return None
        
    filename = os.path.basename(image_url.split("?")[0])
    # Ensure it has an extension
    if not os.path.splitext(filename)[1]:
        filename += ".jpg"
        
    local_path = os.path.join(UPLOADS_DIR, filename)
    if os.path.exists(local_path):
        return filename
        
    try:
        # If it is a relative url or local host url, resolve it
        if "localhost" in image_url and "/uploads/" in image_url:
            return os.path.basename(image_url.split("/uploads/")[-1])
        if image_url.startswith("/uploads/"):
            return os.path.basename(image_url)
            
        logger.info(f"Downloading remote image for transformation: {image_url}")
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(image_url)
            if resp.status_code == 200:
                with open(local_path, "wb") as f:
                    f.write(resp.content)
                return filename
    except Exception as e:
        logger.warning(f"Could not download remote image {image_url}: {e}")
        
    return None


async def transform_and_save_image(original_url: str, angle: float, aspect_ratio: float, suffix: str) -> str:
    """
    Ensures image is local, rotates it by `angle`, crops it to `aspect_ratio` (width / height),
    and saves it with `suffix`. Returns the absolute local URL.
    """
    try:
        # Check if local or download if remote
        local_filename = await ensure_local_image(original_url)
        if not local_filename:
            return original_url
            
        orig_path = os.path.join(UPLOADS_DIR, local_filename)
        if not os.path.exists(orig_path):
            return original_url

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
        base, ext = os.path.splitext(local_filename)
        new_filename = f"{base}_{suffix}{ext}"
        new_path = os.path.join(UPLOADS_DIR, new_filename)
        img_cropped.save(new_path)
        
        return f"http://localhost:8000/uploads/{new_filename}"
    except Exception as e:
        logger.error(f"Failed to transform image: {str(e)}")
        return original_url


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
            # 1. Check if user has uploaded actual images
            if canonical_context.uploaded_images:
                # User uploaded an actual image - perform dynamic angle transformations on it directly
                original_url = canonical_context.uploaded_images[0]
                packshot_url = await transform_and_save_image(original_url, angle=0, aspect_ratio=4/3, suffix="packshot")
                lifestyle_url = await transform_and_save_image(original_url, angle=15, aspect_ratio=4/3, suffix="lifestyle")
                banner_url = await transform_and_save_image(original_url, angle=-10, aspect_ratio=21/9, suffix="banner")
            else:
                # No image uploaded - retrieve vision details and generate custom AI images using prompts
                workflow_data = await self.firebase_mcp.get_workflow(workflow_id) or {}
                image_analysis = workflow_data.get("image_analysis", {})

                # Extract specific visual elements
                img_type = image_analysis.get("product_type") or canonical_context.category
                img_features = ", ".join(image_analysis.get("detected_features") or image_analysis.get("features") or [])
                img_colors = ", ".join(image_analysis.get("suggested_colors") or image_analysis.get("colors") or ["vibrant"])
                img_materials = ", ".join(image_analysis.get("materials") or ["safe educational kit components"])
                img_style = ", ".join(image_analysis.get("style_keywords") or [image_analysis.get("style") or "educational"])

                # Build detailed prompts representing the product visual characteristics
                import urllib.parse
                prompt_packshot = (
                    f"Professional clean product packshot of {canonical_context.product_name}, "
                    f"educational kit {img_type}, containing: {img_features or 'educational items'}. "
                    f"Made of {img_materials}. Brand colors: {img_colors}. Style: {img_style}. "
                    f"Clean studio background, sharp focus, high-end photography"
                )
                prompt_lifestyle = (
                    f"A child learning and playing happily with {canonical_context.product_name} robotics kit, "
                    f"showing hands-on assembly, {img_colors} elements, "
                    f"educational {img_style} design. Bright, cozy classroom/home setting, photography"
                )
                prompt_banner = (
                    f"Creative marketing banner for {canonical_context.product_name} educational STEM course, "
                    f"displaying microcontrollers, electronic circuit boards, coding screen, and abstract blue-purple tech graphics, "
                    f"educational style"
                )

                # Encode prompts for Pollinations AI
                url_packshot = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt_packshot)}?width=800&height=600&nologo=true&private=true"
                url_lifestyle = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt_lifestyle)}?width=800&height=600&nologo=true&private=true"
                url_banner = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt_banner)}?width=1200&height=514&nologo=true&private=true"

                # Download the generated custom images and rotate at different angles (0, 15, -10 degrees)
                packshot_url = await transform_and_save_image(url_packshot, angle=0, aspect_ratio=4/3, suffix="packshot")
                lifestyle_url = await transform_and_save_image(url_lifestyle, angle=15, aspect_ratio=4/3, suffix="lifestyle")
                banner_url = await transform_and_save_image(url_banner, angle=-10, aspect_ratio=21/9, suffix="banner")
            
            images_result = ImageGenerationResult(
                packshot=packshot_url,
                lifestyle_scene=lifestyle_url,
                promotional_banner=banner_url
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
