from app.domain.repositories import (
    WorkflowRepository, StorageRepository, ShopifyService, AIService
)
from app.infrastructure.firebase.firestore import FirestoreWorkflowRepository
from app.infrastructure.firebase.storage import FirebaseStorageRepository
from app.infrastructure.shopify.client import ShopifyAdminServiceClient
from app.infrastructure.ai.gemini import GeminiAIService
from app.use_cases.launch_workflow import LaunchWorkflowUseCase


def get_workflow_repository() -> WorkflowRepository:
    """Supplies concrete Workflow repository instance."""
    return FirestoreWorkflowRepository()


def get_storage_repository() -> StorageRepository:
    """Supplies concrete file storage repository instance."""
    return FirebaseStorageRepository()


def get_shopify_service() -> ShopifyService:
    """Supplies concrete Shopify publishing service client."""
    return ShopifyAdminServiceClient()


def get_ai_service() -> AIService:
    """Supplies concrete AI vision/copy generation service client."""
    return GeminiAIService()


def get_launch_workflow_use_case() -> LaunchWorkflowUseCase:
    """
    Supplies the orchestrating Use Case class, injecting all standard
    repository and service dependencies.
    """
    return LaunchWorkflowUseCase(
        workflow_repo=get_workflow_repository(),
        storage_repo=get_storage_repository(),
        shopify_service=get_shopify_service(),
        ai_service=get_ai_service()
    )
