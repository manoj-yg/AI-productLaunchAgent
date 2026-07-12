from typing import List, Optional
from app.domain.entities import LaunchWorkflow
from app.domain.repositories import WorkflowRepository


class FirestoreWorkflowRepository(WorkflowRepository):
    _mock_db = {}  # In-memory shared mock db for scaffolding

    def __init__(self):
        # Scaffolding: Initialize firebase-admin Firestore client here
        # E.g., self.db = firestore.client()
        pass

    async def create_workflow(self, workflow: LaunchWorkflow) -> LaunchWorkflow:
        """
        Creates a document inside Firebase Firestore.
        """
        self._mock_db[workflow.id] = workflow.model_dump()
        return workflow

    async def get_workflow(self, workflow_id: str) -> Optional[LaunchWorkflow]:
        """
        Fetches a document from Firestore and parses into LaunchWorkflow.
        """
        data = self._mock_db.get(workflow_id)
        if not data:
            return None
        return LaunchWorkflow.model_validate(data)

    async def update_workflow(self, workflow: LaunchWorkflow) -> LaunchWorkflow:
        """
        Updates a document in Firestore.
        """
        self._mock_db[workflow.id] = workflow.model_dump()
        return workflow

    async def list_workflows(self, limit: int = 20, offset: int = 0) -> List[LaunchWorkflow]:
        """
        Queries a collection in Firestore.
        """
        results = []
        for v in list(self._mock_db.values())[offset : offset + limit]:
            results.append(LaunchWorkflow.model_validate(v))
        return results
