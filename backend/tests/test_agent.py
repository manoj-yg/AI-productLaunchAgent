import pytest
from app.agents.product_intake.agent import ProductIntakeAgent
from app.agents.product_intake.schemas import IntakeInput


@pytest.mark.anyio
async def test_intake_agent_success():
    """
    Verifies that the Product Intake Agent successfully validates, 
    normalizes, and constructs the Canonical Product Context.
    """
    agent = ProductIntakeAgent()
    
    input_data = IntakeInput(
        product_name="scratch coding block basics",
        category="scratch",  # Should map to 'Scratch Programming'
        age_group="7-10 years",
        difficulty="beginner",
        price=39.99,
        duration="6 hours",
        language="English",
        tags=["Scratch", "Coding", "Kids", "scratch"],  # Deduplicate & lowercase
        learning_outcomes=["Understand variables", "create simple loops"],
        prerequisites=["Basic computer familiarity"],
        product_images=["mat1.jpg", "mat2.jpg"],
        optional_notes="KiddyPi launch test run."
    )
    
    response = await agent.run(input_data)
    
    assert response.status == "success"
    assert len(response.errors) == 0
    assert response.canonical_context is not None
    
    ctx = response.canonical_context
    assert ctx.product_name == "Scratch Coding Block Basics"  # Title-cased
    assert ctx.category == "Scratch Programming"            # Mapped to valid category
    assert ctx.price == 39.99
    assert ctx.difficulty == "Beginner"
    assert "scratch" in ctx.tags
    assert len(ctx.tags) == 3                                # Deduplicated
    assert len(ctx.uploaded_images) == 2
    assert ctx.workflow_id.startswith("wf-")
    assert ctx.product_id.startswith("prod-")
    assert ctx.status == "draft"


@pytest.mark.anyio
async def test_intake_agent_validation_errors():
    """
    Verifies that validation rules catch invalid/missing fields.
    """
    agent = ProductIntakeAgent()
    
    # Missing required details and price is 0
    invalid_input = IntakeInput(
        product_name="",
        category="",
        age_group="",
        difficulty="",
        price=-10.0,
        tags=[]
    )
    
    response = await agent.run(invalid_input)
    
    assert response.status == "failed"
    assert len(response.errors) > 0
    assert any("product_name" in err for err in response.errors)
    assert any("price" in err for err in response.errors)
    assert response.canonical_context is None
