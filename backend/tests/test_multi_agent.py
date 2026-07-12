import pytest
from fastapi.testclient import TestClient
from app.agents.product_intake.schemas import IntakeInput
from app.agents.workflow.orchestrator import LaunchWorkflowAgent


@pytest.mark.anyio
async def test_full_launch_workflow_agent_orchestration():
    """
    Directly runs the LaunchWorkflowAgent orchestrator to verify the 6-stage pipeline.
    """
    orchestrator = LaunchWorkflowAgent()
    
    input_data = IntakeInput(
        product_name="arduino robot kit elite",
        category="Arduino",
        age_group="10-14 years",
        difficulty="intermediate",
        price=129.99,
        duration="16 hours",
        language="English",
        tags=["Arduino", "Robotics", "C++", "kiddyPi"],
        learning_outcomes=["Understand digital input pins", "Program motor rotation speeds"],
        prerequisites=["Basic block programming knowledge"],
        product_images=["board.jpg"],
        optional_notes="Full automation test."
    )
    
    result = await orchestrator.execute_workflow(input_data)
    
    assert result["status"] == "success"
    assert "workflow_id" in result
    assert "document" in result
    
    doc = result["document"]
    assert doc["status"] == "human_review"
    
    # Verify presence of all expected workflow sub-blocks
    assert "canonical_context" in doc
    assert "image_analysis" in doc
    assert "generated_description" in doc
    assert "features" in doc
    assert "marketing_content" in doc
    assert "image_prompts" in doc
    assert "generated_images" in doc
    assert "recommendations" in doc
    assert "validation_report" in doc
    assert "workflow_logs" in doc
    
    # Inspect content normalizations inside canonical_context
    ctx = doc["canonical_context"]
    assert ctx["product_name"] == "Arduino Robot Kit Elite"
    assert ctx["category"] == "Arduino Courses"
    assert ctx["price"] == 129.99
    assert "arduino" in ctx["tags"]
    
    # Check vision and validation report data
    assert len(doc["image_analysis"]["product_type"]) > 0
    assert doc["validation_report"]["validation_score"] >= 90.0
    
    # Confirm workflow execution logs appended
    assert len(doc["workflow_logs"]) > 1


def test_agent_workflows_api_route(test_client: TestClient):
    """
    Verifies that the /api/v1/agent-workflows endpoint can be triggered successfully.
    """
    payload = {
        "product_name": "python essentials workbook",
        "category": "Python",
        "age_group": "Teens",
        "difficulty": "beginner",
        "price": 24.99,
        "duration": "8 hours",
        "language": "English",
        "tags": ["Python", "Variables", "Loops"],
        "learning_outcomes": ["Write simple scripts", "Understand integer types"],
        "prerequisites": ["None"],
        "product_images": ["cover.png"]
    }
    
    response = test_client.post("/api/v1/agent-workflows", json=payload)
    assert response.status_code == 201
    
    res_data = response.json()
    assert res_data["status"] == "success"
    assert "workflow_id" in res_data
    assert "document" in res_data
    
    doc = res_data["document"]
    assert doc["status"] == "human_review"
    assert "generated_description" in doc
    assert "validation_report" in doc
