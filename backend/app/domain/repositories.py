from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities import (
    LaunchWorkflow, ProductDetails, ImageAnalysis,
    GeneratedDescription, MarketingContent, ImagePrompts,
    ContentValidation, ShopifyPublication
)


class WorkflowRepository(ABC):
    @abstractmethod
    async def create_workflow(self, workflow: LaunchWorkflow) -> LaunchWorkflow:
        """Saves a new workflow state into persistence."""
        pass

    @abstractmethod
    async def get_workflow(self, workflow_id: str) -> Optional[LaunchWorkflow]:
        """Retrieves a workflow by its unique ID."""
        pass

    @abstractmethod
    async def update_workflow(self, workflow: LaunchWorkflow) -> LaunchWorkflow:
        """Updates an existing workflow state."""
        pass

    @abstractmethod
    async def list_workflows(self, limit: int = 20, offset: int = 0) -> List[LaunchWorkflow]:
        """Lists recent workflows."""
        pass


class StorageRepository(ABC):
    @abstractmethod
    async def upload_file(self, file_content: bytes, filename: str, mime_type: str) -> str:
        """Uploads a file to remote storage and returns the public download URL."""
        pass

    @abstractmethod
    async def delete_file(self, file_url: str) -> None:
        """Deletes a file from storage using its URL."""
        pass


class ShopifyService(ABC):
    @abstractmethod
    async def create_product(self, workflow: LaunchWorkflow) -> ShopifyPublication:
        """Publishes the workflow product details and images to Shopify."""
        pass

    @abstractmethod
    async def verify_publication(self, product_id: str) -> bool:
        """Verifies if the published product is active on the Shopify storefront."""
        pass


class AIService(ABC):
    @abstractmethod
    async def analyze_image(self, image_url: str, prompt_override: Optional[str] = None) -> ImageAnalysis:
        """Analyzes a product image using Gemini Multimodal vision capabilities."""
        pass

    @abstractmethod
    async def generate_description(
        self, product_details: ProductDetails, analysis: ImageAnalysis
    ) -> GeneratedDescription:
        """Generates a professional SEO-optimized product description and tags."""
        pass

    @abstractmethod
    async def generate_marketing_content(
        self, details: ProductDetails, description: GeneratedDescription
    ) -> MarketingContent:
        """Generates social media copy, ads, and email newsletters for the product."""
        pass

    @abstractmethod
    async def generate_image_prompts(
        self, details: ProductDetails, analysis: ImageAnalysis
    ) -> ImagePrompts:
        """Generates visual prompt descriptions for image creation models (like Imagen)."""
        pass

    @abstractmethod
    async def validate_content(self, workflow: LaunchWorkflow) -> ContentValidation:
        """Performs AI validation to check description compliance, guidelines, and policies."""
        pass
