import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(test_client: TestClient):
    """Verifies that the health check endpoint returns 200 and indicates healthy configuration."""
    response = test_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "configurations" in data


def test_version_endpoint(test_client: TestClient):
    """Verifies that the version endpoint returns the correct app details."""
    response = test_client.get("/api/v1/version")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data["title"] == "AI Product Launch Platform API"


def test_full_launch_workflow_simulation(test_client: TestClient):
    """
    Triggers the multi-stage launch pipeline from creation to storefront verification
    to ensure routes, usecases, entities, schemas, and dependencies compile and run.
    """
    
    # 1. Initiate Launch
    payload = {
        "product_details": {
            "title": "Eco Cork Yoga Mat",
            "raw_description": "Non-slip cork material with natural rubber base. Durable stitching.",
            "category": "Fitness",
            "target_audience": "Yoga practitioners",
            "price": 79.99,
            "sku": "YOGA-CORK-01",
            "images": ["https://example.com/mat.jpg"]
        }
    }
    
    res = test_client.post("/api/v1/workflows", json=payload)
    assert res.status_code == 201
    workflow = res.json()["workflow"]
    workflow_id = workflow["id"]
    assert workflow["state"] == "UPLOADED"
    
    # 2. Vision analysis
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/analyze")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "ANALYZED"
    
    # 3. Description generation
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/generate-description")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "DESC_GENERATED"
    
    # 4. Marketing copy generation
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/generate-marketing")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "MKTG_GENERATED"
    
    # 5. Diffusion prompts generation
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/generate-prompts")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "PROMPTS_GENERATED"
    
    # 6. Policy checking
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/validate")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "VALIDATED"
    
    # 7 & 8. Human Review approval
    review_payload = {
        "review_notes": "Looks extremely polished, copy is excellent.",
        "is_approved": True,
        "reviewer": "Alex Staff"
    }
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/review", json=review_payload)
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "APPROVED"
    
    # 9. Shopify publishing
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/publish")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "PUBLISHED"
    
    # 10. Storefront Verification
    res = test_client.post(f"/api/v1/workflows/{workflow_id}/verify")
    assert res.status_code == 200
    assert res.json()["workflow"]["state"] == "COMPLETED"
    
    # 11. Final Report retrieve
    res = test_client.get(f"/api/v1/workflows/{workflow_id}")
    assert res.status_code == 200
    data = res.json()["workflow"]
    assert data["state"] == "COMPLETED"
    assert data["publication"]["verification_status"] == "verified"
