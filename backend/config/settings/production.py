"""
FILE:     backend/config/settings/production.py
PURPOSE:  Production overrides — HTTPS, HSTS, secure cookies
"""
from .base import *  # noqa: F401, F403

DEBUG = False

SECURE_SSL_REDIRECT             = True
SECURE_HSTS_SECONDS             = 31_536_000
SECURE_HSTS_INCLUDE_SUBDOMAINS  = True
SECURE_HSTS_PRELOAD             = True
SESSION_COOKIE_SECURE           = True
CSRF_COOKIE_SECURE              = True

# Serve media via S3 in production — set USE_S3=True in .env