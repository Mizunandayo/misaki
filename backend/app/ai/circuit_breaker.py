from __future__ import annotations
from datetime import datetime, timezone
from app.ai.cache import _client
from app.core.config import settings



def _today_key() -> str:
    return datetime.now(timezone.utc).strftime("aiml:daily:%Y-%m-%d")




async def aiml_budget_remaining_usd() -> float:
    raw = await _client().get(_today_key())
    spent_cents = int(raw or 0)
    return max(0.0, settings.AIML_DAILY_USD_CAP - spent_cents / 100.0)




async def record_aiml_spend_usd(amount_usd: float) -> None:
    cents = max(1, int(round(amount_usd * 100)))
    pipe = _client().pipeline()
    pipe.incrby(_today_key(), cents)
    pipe.expire(_today_key(), 86_400)
    await pipe.execute()




def cooldown_key(provider: str) -> str:
    return f"provider:cooldown:{provider}"



async def trip_provider(provider: str, *, seconds: int = 300) -> None:
    await _client().setex(cooldown_key(provider), seconds, "1")





async def is_provider_tripped(provider: str) -> bool:
    return bool(await _client().exists(cooldown_key(provider)))


