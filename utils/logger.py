"""Logging configuration helper for the Students Performance application.

This module provides ``setup_logging()`` which can be called at application
startup to configure a root logger with both a rotating file handler
(``logs/app.log``) and a console handler.

Note:
    When running under Django, the ``LOGGING`` dict in ``core/settings.py``
    takes precedence and configures logging automatically.  This module is
    provided as a convenience for scripts or non-Django entry points.
"""

import logging
import os
from logging.handlers import RotatingFileHandler


def setup_logging() -> logging.Logger:
    """Configure and return the root logger with file and console handlers.

    Creates the ``logs/`` directory relative to this module's parent directory
    if it does not already exist, then attaches:

    - A ``RotatingFileHandler`` writing DEBUG+ messages to ``logs/app.log``
      with a 10 MB size limit and up to 10 backup files.
    - A ``StreamHandler`` writing INFO+ messages to stdout.

    Both handlers use the format::

        %(asctime)s - %(name)s - %(levelname)s - %(message)s

    Returns:
        The configured root ``logging.Logger`` instance.
    """
    # Resolve the logs directory to <project_root>/logs/
    log_dir = os.path.join(os.path.dirname(__file__), '..', 'logs')
    os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    # Rotating file handler — keeps up to 10 × 10 MB log files
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10485760,  # 10 MB per file
        backupCount=10
    )
    file_handler.setLevel(logging.DEBUG)

    # Console handler — only show INFO and above to avoid log noise
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger
