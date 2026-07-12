import os
from typing import List, Union
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    # General Configuration
    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8000)
    LOG_LEVEL: str = Field(default="INFO")
    VERSION: str = Field(default="1.0.0")

    # CORS Configuration
    CORS_ORIGINS: Union[List[str], str] = Field(default=[])

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            return [i.strip() for i in v_stripped.split(",")]
        return v

    # Firebase Settings
    FIREBASE_PROJECT_ID: str = Field(default="")
    FIREBASE_STORAGE_BUCKET: str = Field(default="")
    GOOGLE_APPLICATION_CREDENTIALS: str = Field(default="app/config/firebase-admin.json")

    # Shopify Integration Settings
    SHOPIFY_SHOP_URL: str = Field(default="placeholder-shop.myshopify.com")
    SHOPIFY_ADMIN_API_ACCESS_TOKEN: str = Field(default="shpat_placeholder")
    SHOPIFY_API_VERSION: str = Field(default="2024-04")

    # AI Configurations
    GEMINI_API_KEY: str = Field(default="GEMINI_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.0-flash")

    # MCP (Model Context Protocol) URL Configuration
    MCP_SERVER_URLS: Union[List[str], str] = Field(default=[])

    @field_validator("MCP_SERVER_URLS", mode="before")
    @classmethod
    def assemble_mcp_urls(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                import json
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            return [i.strip() for i in v_stripped.split(",")]
        return v


settings = Settings()

# ── Local file upload directory ───────────────────────────────────────────────
# Resolved to: backend/uploads/ (sibling of the app/ package directory)
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
