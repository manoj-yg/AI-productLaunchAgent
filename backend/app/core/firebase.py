import logging
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.core.config import settings

logger = logging.getLogger("app.firebase")


class FirebaseManager:
    """Manages initialization and connection references for Firebase."""
    _initialized = False
    db = None
    bucket = None

    @classmethod
    def initialize(cls) -> None:
        if cls._initialized:
            return

        try:
            # Check for GOOGLE_APPLICATION_CREDENTIALS file path
            cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
            
            if os.path.exists(cred_path):
                logger.info(f"Initializing Firebase Admin using credentials JSON file: {cred_path}")
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(
                    cred,
                    {"storageBucket": settings.FIREBASE_STORAGE_BUCKET}
                )
            else:
                logger.warning(
                    f"Credentials file '{cred_path}' not found. "
                    f"Attempting Firebase application default initialization."
                )
                # Fallback: Initialize with default cloud run service account credentials if executing in GCP
                firebase_admin.initialize_app(
                    options={"storageBucket": settings.FIREBASE_STORAGE_BUCKET}
                )
            
            cls.db = firestore.client()
            cls.bucket = storage.bucket()
            cls._initialized = True
            logger.info("Firebase Admin SDK successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
            # Do not raise error to allow mock local runs in scaffolding mode
            cls.db = None
            cls.bucket = None


def get_firestore_client():
    """Dependency helper to supply Firestore client."""
    if not FirebaseManager._initialized:
        FirebaseManager.initialize()
    return FirebaseManager.db


def get_storage_bucket():
    """Dependency helper to supply Storage bucket."""
    if not FirebaseManager._initialized:
        FirebaseManager.initialize()
    return FirebaseManager.bucket
