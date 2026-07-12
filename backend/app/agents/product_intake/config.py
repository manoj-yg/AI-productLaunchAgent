from pydantic import BaseModel, Field
from app.core.config import settings


class ProductIntakeAgentConfig(BaseModel):
    """Configuration class for the Product Intake Agent."""
    model_name: str = Field(default=settings.GEMINI_MODEL)
    temperature: float = Field(default=0.1)
    max_output_tokens: int = Field(default=1024)
    brand_name: str = Field(default="KiddyPi")
    company_name: str = Field(default="Subhanu Technologies")
    firestore_collection: str = Field(default="workflows")
    storage_folder: str = Field(default="products")
