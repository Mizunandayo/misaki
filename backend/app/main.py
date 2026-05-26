"""FastAPI application entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1 import healthz, profile
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.middleware.demo_auth import DemoAuthMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

configure_logging()
log = get_logger(__name__)


# ---------- Sentry ----------
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN.get_secret_value(),
        environment=settings.ENVIRONMENT,
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            StarletteIntegration(transaction_style="endpoint"),
        ],
        traces_sample_rate=0.1 if settings.is_production else 1.0,
        send_default_pii=False,
    )


# ---------- Rate limiter ----------
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL.get_secret_value(),
    default_limits=["60/minute"],
)


# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    log.info("misaki_starting", env=settings.ENVIRONMENT)
    yield
    log.info("misaki_shutting_down")


# ---------- App ----------
app = FastAPI(
    title="Misaki API",
    version="0.1.0",
    description="Legislative intelligence platform — Web Data UNLOCKED Hackathon",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Order matters — first added = outermost.
if settings.is_production:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Demo-Key", "X-Request-ID"],
    expose_headers=["X-Request-ID"],
    max_age=600,
)
app.add_middleware(DemoAuthMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)

# ---------- Routers ----------
app.include_router(healthz.router, prefix="/api/v1", tags=["health"])
app.include_router(profile.router, prefix="/api/v1")


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": "Misaki API", "version": "0.1.0"}
