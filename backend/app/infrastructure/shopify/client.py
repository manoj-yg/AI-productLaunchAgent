from datetime import datetime
from app.domain.entities import LaunchWorkflow, ShopifyPublication
from app.domain.repositories import ShopifyService
from app.core.config import settings


class ShopifyAdminServiceClient(ShopifyService):
    def __init__(self):
        # Scaffolding: Configure shopify Admin SDK using core settings
        # shopify.ShopifyResource.activate_session(session)
        pass

    async def create_product(self, workflow: LaunchWorkflow) -> ShopifyPublication:
        """
        Creates a product in Shopify via Admin API using generated text and images.
        """
        # Scaffolding: Returns a mock ShopifyPublication object
        return ShopifyPublication(
            shopify_product_id="gid://shopify/Product/1234567890",
            published_url=f"https://{settings.SHOPIFY_SHOP_URL}/products/{workflow.product_details.title.lower().replace(' ', '-')}",
            published_at=datetime.utcnow(),
            verification_status="pending",
            verification_logs=["Product created in Shopify system draft database."]
        )

    async def verify_publication(self, product_id: str) -> bool:
        """
        Fetches the product status from Shopify Admin to verify live status.
        """
        # Scaffolding mock return (always return True for scaffolding)
        return True
