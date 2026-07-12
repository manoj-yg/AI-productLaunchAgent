import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app.middleware")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    HTTP middleware to measure and log HTTP request method paths, 
    resulting response statuses, and execution latencies.
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            # Formulate access logs
            logger.info(
                f"Method: {request.method} | Path: {request.url.path} | "
                f"Status: {response.status_code} | Latency: {process_time:.2f}ms"
            )
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"FAILED Method: {request.method} | Path: {request.url.path} | "
                f"Error: {str(e)} | Latency: {process_time:.2f}ms"
            )
            raise e
