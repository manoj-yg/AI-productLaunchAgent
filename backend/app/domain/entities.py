from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class WorkflowState(str, Enum):
    IDLE = "IDLE"
    UPLOADED = "UPLOADED"
    ANALYZED = "ANALYZED"
    DESC_GENERATED = "DESC_GENERATED"
    MKTG_GENERATED = "MKTG_GENERATED"
    PROMPTS_GENERATED = "PROMPTS_GENERATED"
    VALIDATED = "VALIDATED"
    REVIEWED = "REVIEWED"
    APPROVED = "APPROVED"
    PUBLISHING = "PUBLISHING"
    PUBLISHED = "PUBLISHED"
    VERIFIED = "VERIFIED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ProductDetails(BaseModel):
    title: str
    raw_description: Optional[str] = None
    category: str
    target_audience: Optional[str] = None
    price: float
    sku: Optional[str] = None
    images: List[str] = Field(default_factory=list)  # URLs of uploaded images


class ImageAnalysis(BaseModel):
    product_type: str
    detected_features: List[str] = Field(default_factory=list)
    suggested_colors: List[str] = Field(default_factory=list)
    materials: List[str] = Field(default_factory=list)
    style_keywords: List[str] = Field(default_factory=list)
    raw_analysis: str


class GeneratedDescription(BaseModel):
    title: str
    description_html: str
    seo_title: str
    seo_description: str
    tags: List[str] = Field(default_factory=list)


class MarketingContent(BaseModel):
    social_copy: Dict[str, str] = Field(
        default_factory=dict, 
        description="e.g. {'instagram': '...', 'facebook': '...'}"
    )
    ad_copy: Dict[str, str] = Field(
        default_factory=dict, 
        description="e.g. {'google_ads': '...', 'meta_ads': '...'}"
    )
    email_newsletter: Optional[str] = None


class ImagePrompts(BaseModel):
    lifestyle_prompts: List[str] = Field(default_factory=list)
    studio_prompts: List[str] = Field(default_factory=list)


class ContentValidation(BaseModel):
    is_valid: bool
    policy_check_passed: bool
    suggestions: List[str] = Field(default_factory=list)
    validation_logs: List[str] = Field(default_factory=list)


class HumanReview(BaseModel):
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    feedback_notes: Optional[str] = None
    is_approved: bool = False


class ShopifyPublication(BaseModel):
    shopify_product_id: Optional[str] = None
    published_url: Optional[str] = None
    published_at: Optional[datetime] = None
    verification_status: str = "pending"  # e.g., verified, failed
    verification_logs: List[str] = Field(default_factory=list)


class LaunchWorkflow(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    state: WorkflowState = WorkflowState.IDLE
    product_details: ProductDetails
    image_analysis: Optional[ImageAnalysis] = None
    generated_description: Optional[GeneratedDescription] = None
    marketing_content: Optional[MarketingContent] = None
    image_prompts: Optional[ImagePrompts] = None
    validation: Optional[ContentValidation] = None
    review: Optional[HumanReview] = None
    publication: Optional[ShopifyPublication] = None
    error_message: Optional[str] = None
