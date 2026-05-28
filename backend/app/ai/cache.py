from __future__ import annotations
import hashlib
import json
from typing import Any
import redis.asyncio as aioredis
from app.core.config import settings


_redis: aioredis.Redis | None = None





def _client() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL.get_secret_value(),
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis




def cache_key(task: str, capability: str, prompt: str) -> str:
    h = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:32]
    return f"gw:{task}:{capability}:{h}"


async def get(key: str) -> Any | None:
    raw = await _client().get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


async def put(key: str, value: Any, *, ttl_seconds: int = 86_400) -> None:
    await _client().setex(key, ttl_seconds, json.dumps(value, default=str))