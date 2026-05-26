"""Request ID Middleware
Generates a UUID per request, attach it to structlog convext, and adds it to the response headers."""


from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        structlog.contextvars.bind_contextvars(request_id=request_id)

        try:
            response = await call_next(request)
        finally:
            structlog.contextvars.clear_contextvars()

        response.headers["X-Request-ID"] = request_id
        return response