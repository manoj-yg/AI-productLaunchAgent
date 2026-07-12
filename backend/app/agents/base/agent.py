import time
import uuid
from typing import Any, Dict
from loguru import logger


class BaseAgent:
    """
    Base Agent for the AI Product Launch Platform.
    Provides standard lifecycle hooks, Loguru tracing, error wrapping,
    and runtime performance auditing.
    """
    def __init__(self, name: str):
        self.name = name

    def log_start(self, workflow_id: str) -> float:
        """Logs start parameters and returns start time."""
        logger.info(f"[{self.name}] Initiating stage run. Workflow ID: {workflow_id}")
        return time.time()

    def log_end(self, workflow_id: str, start_time: float) -> float:
        """Logs completion stats and returns runtime in seconds."""
        duration = time.time() - start_time
        logger.info(
            f"[{self.name}] Completed stage run. Workflow ID: {workflow_id} | "
            f"Execution Time: {duration:.3f}s"
        )
        return duration

    def log_error(self, workflow_id: str, error_message: str) -> None:
        """Logs errors with context details."""
        logger.error(
            f"[{self.name}] ERROR encountered during stage run. "
            f"Workflow ID: {workflow_id} | Detail: {error_message}"
        )
