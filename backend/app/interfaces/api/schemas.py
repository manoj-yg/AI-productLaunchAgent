from typing import List, Optional
from pydantic import BaseModel
from app.domain.entities import ProductDetails, LaunchWorkflow


class InitiateWorkflowRequest(BaseModel):
    product_details: ProductDetails


class HumanReviewRequest(BaseModel):
    review_notes: str
    is_approved: bool
    reviewer: str


class WorkflowResponse(BaseModel):
    workflow: LaunchWorkflow


class WorkflowListResponse(BaseModel):
    workflows: List[LaunchWorkflow]
