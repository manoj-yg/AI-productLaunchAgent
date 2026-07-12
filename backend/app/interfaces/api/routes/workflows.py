import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from app.interfaces.api.schemas import InitiateWorkflowRequest, HumanReviewRequest, WorkflowResponse, WorkflowListResponse
from app.use_cases.launch_workflow import LaunchWorkflowUseCase
from app.interfaces.api.dependencies import get_launch_workflow_use_case
from app.core.config import UPLOADS_DIR

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE_MB = 10


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def initiate_workflow(
    request: InitiateWorkflowRequest,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 1: Initialize launch workflow by uploading product details and image paths.
    """
    try:
        workflow = await use_case.initiate_workflow(request.product_details)
        return WorkflowResponse(workflow=workflow)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{workflow_id}/upload-image")
async def upload_product_image(
    workflow_id: str,
    file: UploadFile = File(...),
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Upload a product image file and attach it to the workflow.
    File is saved to the local uploads/ directory and a local URL is returned.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not allowed. Supported: JPEG, PNG, WebP, GIF"
        )

    # Read file content and check size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File size {size_mb:.1f}MB exceeds maximum of {MAX_IMAGE_SIZE_MB}MB"
        )

    # Build a unique filename
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    unique_name = f"{workflow_id}-{uuid.uuid4().hex[:8]}{ext}"
    save_path = os.path.join(UPLOADS_DIR, unique_name)

    # Write file to disk
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(content)

    # Build accessible URL (backend serves /uploads as static)
    image_url = f"http://localhost:8000/uploads/{unique_name}"

    # Attach image URL to the workflow product details
    workflow = await use_case.workflow_repo.get_workflow(workflow_id)
    if workflow:
        workflow.product_details.images.append(image_url)
        await use_case.workflow_repo.update_workflow(workflow)

    return {"workflow_id": workflow_id, "image_url": image_url, "filename": unique_name}


@router.post("/{workflow_id}/orchestrate")
async def orchestrate_workflow(
    workflow_id: str
):
    """
    Triggers the multi-stage AI agent launch pipeline for an existing product.
    Runs Vision -> Description -> Feature -> Marketing -> Image Prompts -> Image Gen -> Recommendations -> Validation.
    """
    from app.agents.workflow.orchestrator import LaunchWorkflowAgent
    try:
        orchestrator = LaunchWorkflowAgent()
        result = await orchestrator.execute_workflow_on_existing(workflow_id)
        if result["status"] == "failed":
            raise HTTPException(
                status_code=400,
                detail={"message": "Multi-agent pipeline failed to complete.", "errors": result.get("errors", [])}
            )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Deletes a workflow by its unique ID.
    """
    try:
        await use_case.workflow_repo.delete_workflow(workflow_id)
        return {"status": "success", "message": f"Workflow {workflow_id} deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/{workflow_id}/analyze", response_model=WorkflowResponse)
async def analyze_image(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 2: Run AI Multimodal Vision analysis on the product assets.
    """
    try:
        workflow = await use_case.run_ai_analysis(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/generate-description", response_model=WorkflowResponse)
async def generate_description(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 3: Generate SEO-optimized description, title, and tags.
    """
    try:
        workflow = await use_case.generate_product_description(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/generate-marketing", response_model=WorkflowResponse)
async def generate_marketing(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 4: Generate contextual social ad copy and newsletters.
    """
    try:
        workflow = await use_case.generate_marketing_content(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/generate-prompts", response_model=WorkflowResponse)
async def generate_prompts(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 5: Generate prompts for product backdrop and modeling photos.
    """
    try:
        workflow = await use_case.generate_image_prompts(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/validate", response_model=WorkflowResponse)
async def validate_content(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 6: Execute AI automated policy and guideline validations.
    """
    try:
        workflow = await use_case.validate_content(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/review", response_model=WorkflowResponse)
async def submit_human_review(
    workflow_id: str,
    review: HumanReviewRequest,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stages 7 & 8: Human logs evaluation and approves/rejects the generated release.
    """
    try:
        workflow = await use_case.submit_human_review(
            workflow_id=workflow_id,
            review_notes=review.review_notes,
            is_approved=review.is_approved,
            reviewer=review.reviewer
        )
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/publish", response_model=WorkflowResponse)
async def publish_to_shopify(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 9: Publish the approved product catalog item to Shopify.
    """
    try:
        workflow = await use_case.publish_to_shopify(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{workflow_id}/verify", response_model=WorkflowResponse)
async def verify_publication(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 10: Verify the published product links are active and accessible.
    """
    try:
        workflow = await use_case.verify_publication(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow_report(
    workflow_id: str,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Stage 11: Get workflow report / active status query.
    """
    try:
        workflow = await use_case.get_workflow_report(workflow_id)
        return WorkflowResponse(workflow=workflow)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=WorkflowListResponse)
async def list_workflows(
    limit: int = 20,
    offset: int = 0,
    use_case: LaunchWorkflowUseCase = Depends(get_launch_workflow_use_case)
):
    """
    Lists recent active or completed workflows.
    """
    try:
        workflows = await use_case.workflow_repo.list_workflows(limit=limit, offset=offset)
        return WorkflowListResponse(workflows=workflows)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
