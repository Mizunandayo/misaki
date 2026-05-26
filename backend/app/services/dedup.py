from __future__ import annotations

import hashlib

from app.services.redis_client import get_redis

DEDUP_TTL_SECONDS = 86_400  # 24 hours
DEDUP_KEY_PREFIX = "dedup:bill:"





def compute_content_hash(text: str) -> str:
    """SHA-256 of normalized text. Whitespace-collapsed to ignore
    insignificant reformatting between scrapes."""
    normalized = " ".join(text.split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


async def claim_new_content(content_hash: str) -> bool:
    """Returns True if this is the first time we've seen this hash.
    Returns False if a previous scrape already claimed it."""
    client = get_redis()
    key = f"{DEDUP_KEY_PREFIX}{content_hash}"
    result = await client.set(key, "1", nx=True, ex=DEDUP_TTL_SECONDS)
    return bool(result)