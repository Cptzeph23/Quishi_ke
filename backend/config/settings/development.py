"""
FILE:     backend/config/settings/development.py
PURPOSE:  Development overrides — debug on, relaxed throttling, SQL logging
"""
from .base import *  # noqa: F401, F403

DEBUG = True

# Relaxed throttling during development
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {  # noqa: F405
    "anon": "2000/hour",
    "user": "20000/hour",
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname}] {asctime} {module}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
        "apps": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}