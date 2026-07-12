import uuid
from datetime import datetime
from typing import Optional, List

from app.agents.base.agent import BaseAgent
from app.agents.mcp.firebase_mcp import FirebaseMCPClient
from app.agents.mcp.storage_mcp import StorageMCPClient
from app.agents.product_intake.config import ProductIntakeAgentConfig
from app.agents.product_intake.schemas import IntakeInput, CanonicalProductContext, IntakeResponse

class ProductIntakeAgent(BaseAgent):
    """
    Product Intake Agent.
    Inherits from BaseAgent and handles initial product schema normalization and validations.
    """
    def __init__(
        self,
        firebase_mcp: Optional[FirebaseMCPClient] = None,
        storage_mcp: Optional[StorageMCPClient] = None,
        config: Optional[ProductIntakeAgentConfig] = None
    ):
        super().__init__(name="ProductIntakeAgent")
        self.firebase_mcp = firebase_mcp or FirebaseMCPClient()
        self.storage_mcp = storage_mcp or StorageMCPClient()
        self.config = config or ProductIntakeAgentConfig()

    async def run(self, input_data: IntakeInput) -> IntakeResponse:
        workflow_id = f"wf-{uuid.uuid4().hex[:8]}"
        start_time = self.log_start(workflow_id)
        errors = []

        # Validate input parameters
        if not input_data.product_name.strip():
            errors.append("Required field 'product_name' is missing or empty.")
        if not input_data.category.strip():
            errors.append("Required field 'category' is missing or empty.")
        if not input_data.age_group.strip():
            errors.append("Required field 'age_group' is missing or empty.")
        if not input_data.difficulty.strip():
            errors.append("Required field 'difficulty' is missing or empty.")
        if input_data.price <= 0:
            errors.append("Field 'price' must be a decimal value greater than 0.")

        if errors:
            self.log_error(workflow_id, f"Validation failed: {errors}")
            self.log_end(workflow_id, start_time)
            return IntakeResponse(status="failed", errors=errors)

        try:
            # Generate catalog identifiers
            product_id = f"prod-{uuid.uuid4().hex[:8]}"
            
            # Normalize title casing
            normalized_name = input_data.product_name.strip().title()
            
            # Normalise categories to valid KiddyPi tags
            valid_categories = [
                "Programming Courses", "Robotics Kits", "STEM Kits", "Arduino Courses",
                "Python Courses", "Scratch Programming", "Electronics Courses",
                "Raspberry Pi Courses", "Digital Worksheets", "Books", "Flashcards"
            ]
            normalized_category = input_data.category.strip()
            for cat in valid_categories:
                if normalized_category.lower() in cat.lower() or cat.lower() in normalized_category.lower():
                    normalized_category = cat
                    break

            # Normalize lowercase tags
            normalized_tags = list(set([t.strip().lower() for t in input_data.tags if t.strip()]))
            
            # Deduplicate learning outcomes & prerequisites
            outcomes = list(set([o.strip() for o in input_data.learning_outcomes if o.strip()]))
            prereqs = list(set([p.strip() for p in input_data.prerequisites if p.strip()]))

            # Upload images via Storage MCP client
            uploaded_images = []
            for idx, img_path in enumerate(input_data.product_images):
                # Simulated upload or direct file bytes parsing
                img_url = await self.storage_mcp.upload_product_image(
                    file_content=b"mock-content",
                    filename=f"intake-{product_id}-{idx}.jpg"
                )
                uploaded_images.append(img_url)

            # Build Canonical Product Context
            iso_now = datetime.utcnow().isoformat() + "Z"
            canonical_context = CanonicalProductContext(
                workflow_id=workflow_id,
                product_id=product_id,
                product_name=normalized_name,
                category=normalized_category,
                price=input_data.price,
                currency="USD",
                age_group=input_data.age_group.strip(),
                difficulty=input_data.difficulty.strip().capitalize(),
                duration=input_data.duration,
                language=input_data.language.strip(),
                learning_outcomes=outcomes,
                prerequisites=prereqs,
                tags=normalized_tags,
                uploaded_images=uploaded_images,
                status="draft",
                created_at=iso_now,
                updated_at=iso_now
            )

            # Save draft context document using Firebase MCP Client
            doc_payload = {
                "workflow_id": workflow_id,
                "canonical_context": canonical_context.model_dump(),
                "created_at": iso_now,
                "updated_at": iso_now
            }
            await self.firebase_mcp.save_workflow(workflow_id, doc_payload)

            duration = self.log_end(workflow_id, start_time)
            # Log metrics to logging sub-collection
            await self.firebase_mcp.add_workflow_log(
                workflow_id, 
                f"[ProductIntakeAgent] Executed successfully. Duration: {duration:.3f}s"
            )

            return IntakeResponse(status="success", canonical_context=canonical_context)

        except Exception as e:
            self.log_error(workflow_id, str(e))
            self.log_end(workflow_id, start_time)
            await self.firebase_mcp.add_workflow_log(workflow_id, f"[ProductIntakeAgent] FAILED: {str(e)}")
            return IntakeResponse(status="failed", errors=[f"Processing error: {str(e)}"])
