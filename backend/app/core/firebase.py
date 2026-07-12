import logging
import os
import json
import base64
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

        # Mark as initialized immediately to prevent duplicate calls
        cls._initialized = True

        try:
            # 1. Check if Service Account JSON key is passed directly via environment variable
            service_key_json = os.environ.get("GCP_SERVICE_ACCOUNT_KEY_JSON")
            cred = None

            if service_key_json:
                try:
                    service_key_json = service_key_json.strip()
                    if service_key_json.startswith("{"):
                        key_data = json.loads(service_key_json)
                    else:
                        decoded_bytes = base64.b64decode(service_key_json)
                        key_data = json.loads(decoded_bytes.decode("utf-8"))
                    logger.info("Initializing Firebase Admin using environment service account key JSON payload.")
                    cred = credentials.Certificate(key_data)
                except Exception as e:
                    logger.error(f"Failed to parse GCP_SERVICE_ACCOUNT_KEY_JSON: {str(e)}")

            # 2. If no JSON payload, check for certificate path file
            if not cred:
                cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
                if cred_path and os.path.exists(cred_path):
                    logger.info(f"Initializing Firebase Admin using credentials certificate file: {cred_path}")
                    cred = credentials.Certificate(cred_path)

            # Initialize firebase app — skip if already exists
            if firebase_admin._apps:
                logger.info("Firebase Admin app already initialized — reusing existing instance.")
            elif cred:
                firebase_admin.initialize_app(cred, {"storageBucket": settings.FIREBASE_STORAGE_BUCKET})
                logger.info("Firebase Admin SDK initialized with service account credentials.")
            else:
                logger.warning(
                    "No Firebase credentials found. Running in local in-memory mode. "
                    "Set GOOGLE_APPLICATION_CREDENTIALS to enable Firestore persistence."
                )
                # Do NOT call initialize_app without credentials — it will fail
                cls.db = None
                cls.bucket = None
                return

            cls.db = firestore.client()
            cls.bucket = storage.bucket()
            logger.info("Firebase Admin SDK successfully connected to Firestore and Storage.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {str(e)}")
            # Fail gracefully — all repos will use in-memory mock
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
