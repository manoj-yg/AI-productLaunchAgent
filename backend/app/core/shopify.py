import logging
import shopify
from app.core.config import settings

logger = logging.getLogger("app.shopify")


class ShopifySessionManager:
    """Manages sessions for Shopify API calls."""
    
    @classmethod
    def get_session(cls) -> shopify.Session:
        """
        Creates and returns a Shopify API Session configuration.
        """
        try:
            shop_url = settings.SHOPIFY_SHOP_URL
            api_version = settings.SHOPIFY_API_VERSION
            token = settings.SHOPIFY_ADMIN_API_ACCESS_TOKEN
            
            logger.debug(f"Creating Shopify session context for shop: {shop_url}")
            return shopify.Session(shop_url, api_version, token)
        except Exception as e:
            logger.error(f"Failed to generate Shopify Session configuration: {str(e)}")
            raise e

    @classmethod
    def activate(cls) -> None:
        """
        Activates global shopify session.
        """
        try:
            session = cls.get_session()
            shopify.ShopifyResource.activate_session(session)
            logger.info("Shopify Session successfully activated.")
        except Exception as e:
            logger.error(f"Failed to activate Shopify Session: {str(e)}")


    @classmethod
    def deactivate(cls) -> None:
        """
        Deactivates global shopify session.
        """
        shopify.ShopifyResource.clear_session()
        logger.debug("Shopify Session cleared.")
