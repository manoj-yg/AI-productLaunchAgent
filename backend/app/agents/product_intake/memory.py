from typing import Dict, Any, List


class IntakeAgentMemory:
    """
    Scaffolding for a lightweight memory context.
    Tracks intermediate tool execution logs and parameters.
    """
    def __init__(self):
        self.history: List[Dict[str, Any]] = []
        self.execution_logs: List[str] = []

    def record_step(self, tool_name: str, input_args: Dict[str, Any], output_val: Any) -> None:
        """Logs an execution step."""
        self.history.append({
            "tool": tool_name,
            "inputs": input_args,
            "output": output_val
        })
        self.execution_logs.append(f"Executed tool '{tool_name}' successfully.")

    def add_log(self, message: str) -> None:
        """Appends a custom log line."""
        self.execution_logs.append(message)

    def get_logs(self) -> List[str]:
        """Retrieves logs array."""
        return self.execution_logs

    def clear(self) -> None:
        """Resets memory state."""
        self.history.clear()
        self.execution_logs.clear()
