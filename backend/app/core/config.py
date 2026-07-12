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
    CORS_ORIGINS: List[str] = Field(default=[])

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Firebase Settings
    FIREBASE_PROJECT_ID: str = Field(default="placeholder-project-id")
    FIREBASE_STORAGE_BUCKET: str = Field(default="placeholder-storage-bucket")
    GOOGLE_APPLICATION_CREDENTIALS: str = Field(default="config/firebase-service-account.json")

    # Shopify Integration Settings
    SHOPIFY_SHOP_URL: str = Field(default="placeholder-shop.myshopify.com")
    SHOPIFY_ADMIN_API_ACCESS_TOKEN: str = Field(default="shpat_placeholder")
    SHOPIFY_API_VERSION: str = Field(default="2024-04")

    # AI Configurations
    GEMINI_API_KEY: str = Field(default="AIzaSyPlaceholder")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")

    # MCP (Model Context Protocol) URL Configuration
    MCP_SERVER_URLS: List[str] = Field(default=[])

    @field_validator("MCP_SERVER_URLS", mode="before")
    @classmethod
    def assemble_mcp_urls(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()
