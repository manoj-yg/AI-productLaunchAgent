import logging
from typing import Dict, Any, Optional
from app.core.firebase import get_firestore_client

logger = logging.getLogger("app.mcp.firebase")


class FirebaseMCPClient:
    """
    Model Context Protocol (MCP) Client for Firebase Firestore.
    Provides database read/write abstractions.
    """
    _mock_db: Dict[str, Dict[str, Any]] = {}  # Fallback shared in-memory database
    _mock_logs: Dict[str, list] = {}
    _mock_reports: Dict[str, Dict[str, Any]] = {}

    def __init__(self):
        self.db = get_firestore_client()
        self.workflow_collection = "products"  # single document structure in products collection
        self.logs_collection = "workflow_logs"
        self.reports_collection = "reports"

    async def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves unified workflow document by ID."""
        if self.db:
            try:
                doc_ref = self.db.collection(self.workflow_collection).document(workflow_id)
                doc = doc_ref.get()
                if doc.exists:
                    return doc.to_dict()
                return None
            except Exception as e:
                logger.error(f"Firebase MCP failed to read document: {str(e)}")
                raise e
        else:
            return self._mock_db.get(workflow_id)

    async def save_workflow(self, workflow_id: str, data: Dict[str, Any]) -> None:
        """Saves or merges workflow states inside the single product document."""
        if self.db:
            try:
                doc_ref = self.db.collection(self.workflow_collection).document(workflow_id)
                doc_ref.set(data, merge=True)
                logger.debug(f"Firebase MCP successfully updated workflows collection for ID: {workflow_id}")
            except Exception as e:
                logger.error(f"Firebase MCP failed to merge doc: {str(e)}")
                raise e
        else:
            if workflow_id not in self._mock_db:
                self._mock_db[workflow_id] = {}
            self._mock_db[workflow_id].update(data)

    async def add_workflow_log(self, workflow_id: str, log_entry: str) -> None:
        """Appends log events inside firestore."""
        if self.db:
            try:
                doc_ref = self.db.collection(self.logs_collection).document(workflow_id)
                # Read, append, and update
                doc = doc_ref.get()
                current_logs = doc.to_dict().get("logs", []) if doc.exists else []
                current_logs.append(log_entry)
                doc_ref.set({"logs": current_logs})
            except Exception as e:
                logger.error(f"Firebase MCP failed to write workflow logs: {str(e)}")
        else:
            if workflow_id not in self._mock_logs:
                self._mock_logs[workflow_id] = []
            self._mock_logs[workflow_id].append(log_entry)

    async def save_report(self, workflow_id: str, report_data: Dict[str, Any]) -> None:
        """Saves audit results to the reports collection."""
        if self.db:
            try:
                doc_ref = self.db.collection(self.reports_collection).document(workflow_id)
                doc_ref.set(report_data)
            except Exception as e:
                logger.error(f"Firebase MCP failed to save audit report: {str(e)}")
        else:
            self._mock_reports[workflow_id] = report_data
