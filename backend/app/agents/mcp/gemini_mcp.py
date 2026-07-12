import logging
from typing import Type, Any, Optional
from pydantic import BaseModel
from google.genai import types
from app.core.ai import AIManager
from app.core.config import settings

logger = logging.getLogger("app.mcp.gemini")


class GeminiMCPClient:
    """
    Model Context Protocol (MCP) Client for Gemini AI engine.
    Agents use this client to execute generation calls without importing the Gemini SDK directly.
    """
    def __init__(self):
        self.client = AIManager.get_client()
        self.default_model = settings.GEMINI_MODEL

    async def generate_structured_content(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Type[BaseModel],
        image_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None
    ) -> Any:
        """
        Invokes Gemini to generate structured output conforming to the response Pydantic schema.
        """
        # Check if the API key is a dummy placeholder
        api_key = settings.GEMINI_API_KEY
        is_placeholder = (
            not api_key
            or "YourGeminiApiKeyHere" in api_key
            or "placeholder" in api_key.lower()
            or api_key == "dummy"
        )

        if not self.client or is_placeholder:
            logger.warning("Google GenAI client not initialized or using dummy API key. Returning mock schema.")
            return response_schema.model_construct()

        try:
            contents = [prompt]
            
            # If vision analysis includes image bytes, parse as inline part
            if image_bytes and mime_type:
                contents.append(
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=mime_type
                    )
                )

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=response_schema
            )

            # Execution call
            response = self.client.models.generate_content(
                model=self.default_model,
                contents=contents,
                config=config
            )
            
            # Validate and parse response text into target pydantic schema
            return response_schema.model_validate_json(response.text)
        except Exception as e:
            logger.warning(f"Failed to generate structured content from Gemini: {str(e)}. Falling back to model_construct.")
            return response_schema.model_construct()
