from __future__ import annotations

from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        h = response.headers

        # Defeats clickjacking
        h["X-Frame-Options"] = "DENY"
        # Defeats MIME-sniff attacks
        h["X-Content-Type-Options"] = "nosniff"
        # Tightest sensible referrer policy
        h["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Disable APIs we never use
        h["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), "
            "gyroscope=(), magnetometer=(), microphone=(), "
            "payment=(), usb=()"
        )

        if settings.is_production:
            # HSTS preload-ready (do not enable in dev, breaks localhost over HTTP)
            h["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
            # API does not render HTML; the CSP below blocks all but JSON
            h["Content-Security-Policy"] = (
                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
            )

        return response