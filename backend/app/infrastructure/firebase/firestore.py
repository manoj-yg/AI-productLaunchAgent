import logging
from typing import List, Optional
from app.domain.entities import LaunchWorkflow
from app.domain.repositories import WorkflowRepository
from app.core.firebase import get_firestore_client

logger = logging.getLogger("app.infrastructure.firestore")


class FirestoreWorkflowRepository(WorkflowRepository):
    _mock_db = {}  # Shared class-level in-memory mock database

    def __init__(self):
        # Retrieve initialized firestore client
        self.db = get_firestore_client()
        self.collection_name = "workflows"

    async def create_workflow(self, workflow: LaunchWorkflow) -> LaunchWorkflow:
        """
        Saves a new workflow document in firestore (or mock DB if offline).
        """
        if self.db:
            try:
                doc_ref = self.db.collection(self.collection_name).document(workflow.id)
                # set() is blocking in the standard firestore client; wrapping or calling directly
                doc_ref.set(workflow.model_dump())
                logger.info(f"Workflow '{workflow.id}' created in Firestore.")
            except Exception as e:
                logger.error(f"Failed to create workflow in Firestore: {str(e)}")
                raise e
        else:
            self._mock_db[workflow.id] = workflow.model_dump()
        return workflow

    async def get_workflow(self, workflow_id: str) -> Optional[LaunchWorkflow]:
        """
        Retrieves a workflow document from Firestore (or mock DB).
        """
        if self.db:
            try:
                doc_ref = self.db.collection(self.collection_name).document(workflow_id)
                doc = doc_ref.get()
                if not doc.exists:
                    return None
                return LaunchWorkflow.model_validate(doc.to_dict())
            except Exception as e:
                logger.error(f"Failed to get workflow from Firestore: {str(e)}")
                raise e
        else:
            data = self._mock_db.get(workflow_id)
            if not data:
                return None
            return LaunchWorkflow.model_validate(data)

    async def update_workflow(self, workflow: LaunchWorkflow) -> LaunchWorkflow:
        """
        Updates an existing workflow document in Firestore.
        """
        if self.db:
            try:
                doc_ref = self.db.collection(self.collection_name).document(workflow.id)
                doc_ref.set(workflow.model_dump(), merge=True)
                logger.info(f"Workflow '{workflow.id}' updated in Firestore.")
            except Exception as e:
                logger.error(f"Failed to update workflow in Firestore: {str(e)}")
                raise e
        else:
            self._mock_db[workflow.id] = workflow.model_dump()
        return workflow

    async def list_workflows(self, limit: int = 20, offset: int = 0) -> List[LaunchWorkflow]:
        """
        Lists workflows sorted by creation time.
        """
        if self.db:
            try:
                docs = (
                    self.db.collection(self.collection_name)
                    .order_by("created_at", direction="DESCENDING")
                    .limit(limit)
                    .offset(offset)
                    .stream()
                )
                return [LaunchWorkflow.model_validate(doc.to_dict()) for doc in docs]
            except Exception as e:
                logger.error(f"Failed to list workflows from Firestore: {str(e)}")
                raise e
        else:
            results = []
            for v in list(self._mock_db.values())[offset : offset + limit]:
                results.append(LaunchWorkflow.model_validate(v))
            return results

    async def delete_workflow(self, workflow_id: str) -> None:
        """
        Deletes a workflow document from Firestore (or mock DB).
        """
        if self.db:
            try:
                self.db.collection(self.collection_name).document(workflow_id).delete()
                logger.info(f"Workflow '{workflow_id}' deleted from Firestore.")
            except Exception as e:
                logger.error(f"Failed to delete workflow from Firestore: {str(e)}")
                raise e
        else:
            if workflow_id in self._mock_db:
                del self._mock_db[workflow_id]
