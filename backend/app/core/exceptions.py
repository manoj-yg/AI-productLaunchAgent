import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("app.exceptions")


class BaseAppException(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class WorkflowNotFoundException(BaseAppException):
    """Raised when a workflow ID does not exist in persistence."""
    def __init__(self, workflow_id: str):
        super().__init__(
            message=f"Workflow with ID '{workflow_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class AIServiceException(BaseAppException):
    """Raised when an error occurs during AI vision analysis or prompt generations."""
    def __init__(self, details: str):
        super().__init__(
            message=f"AI Service processing error: {details}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )


class ShopifyServiceException(BaseAppException):
    """Raised when a Shopify publishing sync or active check fails."""
    def __init__(self, details: str):
        super().__init__(
            message=f"Shopify synchronization error: {details}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )


def register_exception_handlers(app: FastAPI) -> None:
    """Registers global exception handlers to format responses uniformly."""
    
    @app.exception_handler(BaseAppException)
    async def app_exception_handler(request: Request, exc: BaseAppException):
        logger.error(f"Application error occurred: {exc.message} on path {request.url.path}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error_code": exc.__class__.__name__,
                "detail": exc.message
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled system error occurred on path {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error_code": "InternalServerError",
                "detail": "An unexpected system error occurred on the server."
            }
        )
