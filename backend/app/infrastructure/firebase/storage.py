from app.domain.repositories import StorageRepository


class FirebaseStorageRepository(StorageRepository):
    def __init__(self):
        # Scaffolding: Initialize firebase-admin Storage client here
        # E.g., self.bucket = storage.bucket()
        pass

    async def upload_file(self, file_content: bytes, filename: str, mime_type: str) -> str:
        """
        Uploads an image file to Firebase Storage.
        Returns a mock download URL.
        """
        # Scaffolding mock return
        return f"https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/{filename}?alt=media"

    async def delete_file(self, file_url: str) -> None:
        """
        Deletes the file from Firebase Storage.
        """
        pass
