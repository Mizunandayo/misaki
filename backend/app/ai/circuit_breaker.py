from __future__ import annotations
from datetime import datetime, timezone
from app.ai.cache import _client
from app.core.config import settings



def _daily_key(namespace: str) -> str:
    return datetime.now(timezone.utc).strftime(f"{namespace}:daily:%Y-%m-%d")


async def _daily_counter(namespace: str) -> int:
    raw = await _client().get(_daily_key(namespace))
    return int(raw or 0)


async def _record_daily(namespace: str, amount: int) -> None:
    key = _daily_key(namespace)
    pipe = _client().pipeline()
    pipe.incrby(key, amount)
    pipe.expire(key, 86_400)
    await pipe.execute()


# --- AI/ML API (USD cap) ---
async def aiml_budget_remaining_usd() -> float:
    return max(0.0, settings.AIML_DAILY_USD_CAP - await _daily_counter("aiml") / 100.0)


async def record_aiml_spend_usd(amount_usd: float) -> None:
    await _record_daily("aiml", max(1, int(round(amount_usd * 100))))


# --- Gemini (USD cap on the paid key — the default route) ---
async def gemini_budget_remaining_usd() -> float:
    return max(0.0, settings.GEMINI_DAILY_USD_CAP - await _daily_counter("gemini") / 100.0)


async def record_gemini_spend_usd(amount_usd: float) -> None:
    await _record_daily("gemini", max(1, int(round(amount_usd * 100))))


# --- Bright Data (live-call cap on the coupon budget) ---
async def brightdata_calls_remaining() -> int:
    return max(0, settings.BRIGHT_DATA_DAILY_CALL_CAP - await _daily_counter("brightdata"))


async def record_brightdata_call() -> None:
    await _record_daily("brightdata", 1)




def cooldown_key(provider: str) -> str:
    return f"provider:cooldown:{provider}"



async def trip_provider(provider: str, *, seconds: int = 300) -> None:
    await _client().setex(cooldown_key(provider), seconds, "1")





async def is_provider_tripped(provider: str) -> bool:
    return bool(await _client().exists(cooldown_key(provider)))


