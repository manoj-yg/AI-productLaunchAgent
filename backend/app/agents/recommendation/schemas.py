from typing import List, Optional
from pydantic import BaseModel, Field
from app.domain.entities import ProductRecommendation

class RecommendationResponse(BaseModel):
    """Structured response wrap returned by the Recommendation Agent."""
    status: str = Field(description="Result of execution: 'success' or 'failed'.")
    errors: List[str] = Field(default_factory=list, description="List of processing error messages.")
    recommendations: List[ProductRecommendation] = Field(default_factory=list, description="List of matching recommended products.")
