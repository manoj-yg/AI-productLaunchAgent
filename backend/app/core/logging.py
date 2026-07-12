import logging.config
from typing import Dict, Any


def setup_logging(log_level: str = "INFO", environment: str = "production") -> None:
    """
    Sets up the application-wide logging configuration.
    Uses clean structured formats for local console streams.
    """
    # Standard formatters
    formatters = {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d): %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S"
        },
        "json": {
            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s"
        }
    }

    # Use JSON formatter in production containerized runtimes for parsing engines (e.g. Cloud Logging)
    formatter_selection = "standard" if environment == "development" else "standard" # fallback to standard if jsonlogger not installed

    handlers = {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": formatter_selection,
            "stream": "ext://sys.stdout"
        }
    }

    log_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": formatters,
        "handlers": handlers,
        "root": {
            "level": log_level.upper(),
            "handlers": ["console"]
        },
        "loggers": {
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "app": {
                "level": log_level.upper(),
                "handlers": ["console"],
                "propagate": False
            }
        }
    }

    logging.config.dictConfig(log_config)
