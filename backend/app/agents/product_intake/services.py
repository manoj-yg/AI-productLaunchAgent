from abc import ABC, abstractmethod
from typing import List, Dict, Any


class StorageMCPInterface(ABC):
    """
    Abstract Interface representing a Model Context Protocol (MCP) Storage adapter.
    Encapsulates file uploading channels without calling Cloud Storage APIs directly.
    """
    @abstractmethod
    async def upload_image(self, image_source: str, folder_destination: str) -> str:
        """
        Uploads image using an MCP tool pipeline.
        Returns the public URL of the uploaded image.
        """
        pass


class FirestoreMCPInterface(ABC):
    """
    Abstract Interface representing a Model Context Protocol (MCP) Firestore database adapter.
    Encapsulates document saving channels without calling Firestore APIs directly.
    """
    @abstractmethod
    async def save_draft(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """
        Saves a catalog document draft using an MCP tool pipeline.
        Returns True if successful, False otherwise.
        """
        pass
