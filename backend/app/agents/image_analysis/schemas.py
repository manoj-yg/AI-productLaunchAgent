from typing import List, Optional
from pydantic import BaseModel, Field


class ImageAnalysisResult(BaseModel):
    """The structured vision analysis results returned by the AI vision agent."""
    product_type: str = Field(description="Visual classification of the product (e.g. Robotics Board, PDF Worksheet).")
    category: str = Field(description="Mapped category category.")
    colors: List[str] = Field(description="List of visually dominant colors in the product images.")
    materials: List[str] = Field(description="Detected physical materials (e.g., Plastic, Paper, Metal, Wood).")
    style: str = Field(description="Visual design style (e.g. playful, high-tech, minimalist, modern).")
    objects: List[str] = Field(description="List of distinct objects or parts detected visually.")
    features: List[str] = Field(description="Visually prominent product features.")
    target_audience: str = Field(description="Apparent target audience demographic based on visual elements.")
    summary: str = Field(description="Comprehensive visual inspection summary paragraph.")
    confidence_score: float = Field(description="Vision categorization confidence factor between 0.0 and 1.0.")


class ImageAnalysisResponse(BaseModel):
    """Structured response wrap returned by the Image Analysis Agent."""
    status: str = Field(description="Result of execution: 'success' or 'failed'.")
    errors: List[str] = Field(default_factory=list, description="List of processing error messages.")
    analysis: Optional[ImageAnalysisResult] = Field(default=None, description="The validated structured vision details.")
export_result = ImageAnalysisResult
