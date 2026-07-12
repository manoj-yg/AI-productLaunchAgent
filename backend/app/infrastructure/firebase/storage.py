import logging
from urllib.parse import urlparse
from app.domain.repositories import StorageRepository
from app.core.firebase import get_storage_bucket

logger = logging.getLogger("app.infrastructure.storage")


class FirebaseStorageRepository(StorageRepository):
    def __init__(self):
        # Retrieve initialized storage bucket client
        self.bucket = get_storage_bucket()

    async def upload_file(self, file_content: bytes, filename: str, mime_type: str) -> str:
        """
        Uploads an image file to the Firebase Storage bucket.
        Falls back to a mock URL if Firebase is offline.
        """
        if self.bucket:
            try:
                blob = self.bucket.blob(f"products/{filename}")
                # Synchronous call wrapped directly
                blob.upload_from_string(file_content, content_type=mime_type)
                
                # Make the blob public to retrieve downloadable links
                blob.make_public()
                logger.info(f"File '{filename}' successfully uploaded to Firebase Storage.")
                return blob.public_url
            except Exception as e:
                logger.error(f"Failed to upload file to Firebase Storage: {str(e)}")
                raise e
        else:
            return f"https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/products%2F{filename}?alt=media"

    async def delete_file(self, file_url: str) -> None:
        """
        Deletes the file from Firebase Storage.
        """
        if self.bucket:
            try:
                # Parse blob name from URL path
                parsed_url = urlparse(file_url)
                # E.g. /v0/b/bucket-name/o/products%2Ffilename
                path_parts = parsed_url.path.split("/o/")
                if len(path_parts) > 1:
                    # Retrieve the raw URL encoded filepath (products%2Ffilename) and decode/replace
                    blob_name = path_parts[1].replace("%2F", "/")
                    blob = self.bucket.blob(blob_name)
                    blob.delete()
                    logger.info(f"File '{blob_name}' deleted from Firebase Storage.")
            except Exception as e:
                logger.error(f"Failed to delete file from Firebase Storage: {str(e)}")
                raise e
