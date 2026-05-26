"""Async Redis client singleton."""

from __future__ import annotations

from functools import lru_cache

from redis.asyncio import Redis, from_url

from app.core.config import settings


@lru_cache(maxsize=1)
def get_redis() -> Redis:
    return from_url(
        settings.REDIS_URL.get_secret_value(),
        decode_responses=True,
        socket_timeout=5,
        socket_connect_timeout=5,
        retry_on_timeout=True,
        health_check_interval=30,
    )





