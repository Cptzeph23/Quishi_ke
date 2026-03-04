"""
FILE:     backend/apps/audit/middleware.py
PURPOSE:  Automatically records every non-safe API request to the audit_logs table.
          Scrubs sensitive fields (password, token, etc.) from request bodies.
"""
import time
import json

SKIP_METHODS  = {"GET", "HEAD", "OPTIONS"}
SCRUB_FIELDS  = {"password", "password2", "token", "secret", "access", "refresh"}
API_PATH_PREFIX = "/api/"


class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        t0       = time.monotonic()
        response = self.get_response(request)
        duration = int((time.monotonic() - t0) * 1000)

        # Only log mutating calls to the API
        if (
            request.method not in SKIP_METHODS
            and request.path.startswith(API_PATH_PREFIX)
        ):
            self._record(request, response, duration)

        return response

    def _record(self, request, response, duration: int):
        from .models import AuditLog  # avoid circular import at module level

        # Parse + scrub body
        body = None
        try:
            raw = request.body
            if raw:
                parsed = json.loads(raw)
                body   = {
                    k: ("***" if k in SCRUB_FIELDS else v)
                    for k, v in parsed.items()
                }
        except Exception:
            pass

        # Real IP (handle reverse proxies)
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        ip = (forwarded.split(",")[0].strip() if forwarded
              else request.META.get("REMOTE_ADDR")) or None

        AuditLog.objects.create(
            user         = request.user if request.user.is_authenticated else None,
            method       = request.method,
            path         = request.path[:500],
            status_code  = response.status_code,
            ip_address   = ip,
            user_agent   = request.META.get("HTTP_USER_AGENT", "")[:512],
            request_body = body,
            duration_ms  = duration,
        )