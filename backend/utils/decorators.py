"""Utility decorators for the Students Performance application."""

import functools
import logging
import time

logger = logging.getLogger(__name__)


def log_execution_time(func):
    """Log the execution time of a view or function."""

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.monotonic()
        result = func(*args, **kwargs)
        duration_ms = round((time.monotonic() - start) * 1000, 2)
        logger.debug("%s executed in %sms", func.__qualname__, duration_ms)
        return result

    return wrapper
