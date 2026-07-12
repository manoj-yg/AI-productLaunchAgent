import logging
import uuid
from app.core.firebase import get_storage_bucket

logger = logging.getLogger("app.mcp.storage")


class StorageMCPClient:
    """
    Model Context Protocol (MCP) Client for Storage.
    Encapsulates image assets syncing to Firebase Storage buckets.
    """
    def __init__(self):
        self.bucket = get_storage_bucket()

    async def upload_product_image(self, file_content: bytes, filename: str, mime_type: str = "image/jpeg") -> str:
        """
        Uploads product image file, making it publicly readable and returning its download URL.
        """
        if self.bucket:
            try:
                # Store assets inside dedicated products directory
                blob = self.bucket.blob(f"products/{filename}")
                blob.upload_from_string(file_content, content_type=mime_type)
                blob.make_public()
                return blob.public_url
            except Exception as e:
                logger.error(f"Storage MCP client failed to upload file: {str(e)}")
                raise e
        else:
            logger.warning("Firebase Storage is offline. Returning simulated image path URL.")
            return f"https://firebasestorage.googleapis.com/v0/b/kiddypi/o/products%2F{filename}?alt=media"
