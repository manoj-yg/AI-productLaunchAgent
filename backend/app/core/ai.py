import logging
from google import genai
from app.core.config import settings

logger = logging.getLogger("app.ai")


class AIManager:
    """Manages connections and client initializers for AI engines."""
    _client = None

    @classmethod
    def get_client(cls) -> genai.Client:
        """
        Retrieves the singleton client for the Google GenAI SDK.
        """
        if cls._client is None:
            try:
                api_key = settings.GEMINI_API_KEY
                logger.info("Initializing Google GenAI SDK Client...")
                # In scaffolding mode, check key prefix or structure
                cls._client = genai.Client(api_key=api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Google GenAI SDK Client: {str(e)}")
                # Fail gracefully or return a mock proxy if key isn't provided yet
                cls._client = None
        return cls._client

    @classmethod
    def get_mcp_endpoints(cls):
        """
        Retrieves configured endpoints for Model Context Protocol.
        """
        return settings.MCP_SERVER_URLS
