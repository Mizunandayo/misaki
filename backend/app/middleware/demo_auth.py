"""
Demo authentication middleware.

For the hackathon, full Supabase Auth is replaced by a single
DEMO_API_KEY that the frontend sends on every request. Protects
Bright Data credits without the engineering cost of a real auth
stack.

PUBLIC_PATHS lists endpoints that bypass key validation (landing
page, scanner, ask misaki, SSE streams). They still get rate
limited via slowapi.
"""
from __future__ import annotations

import hmac
from collections.abc import Awaitable, Callable

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger(__name__)


PUBLIC_PATHS: frozenset[str] = frozenset({
    "/api/v1/healthz",
    "/api/v1/scanner",
    "/api/v1/ask",
    "/docs",
    "/openapi.json",
    "/",
})


class DemoAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if self._is_public(request.url.path):
            return await call_next(request)

        provided = request.headers.get("X-Demo-Key", "")
        expected = settings.DEMO_API_KEY.get_secret_value()

        # constant-time comparison defeats timing attacks
        if not hmac.compare_digest(provided, expected):
            log.warning(
                "demo_auth_rejected",
                path=request.url.path,
                client=request.client.host if request.client else "unknown",
            )
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or missing demo key"},
            )

        return await call_next(request)

    @staticmethod
    def _is_public(path: str) -> bool:
        if path in PUBLIC_PATHS:
            return True
        if path.startswith("/api/v1/public/"):
            return True
        # EventSource cannot send custom headers, so SSE streams must be public.
        # The endpoint is gated by UUID path validation + slowapi rate limit.
        if path.startswith("/api/v1/assessments/") and path.endswith("/stream"):
            return True
        return False
