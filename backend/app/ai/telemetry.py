from __future__ import annotations
import uuid
from typing import Literal
from sqlalchemy import text
from app.db.session import session_scope


Status = Literal["ok", "retry", "fallback", "error"]




async def record_call(
    *,
    run_id: uuid.UUID | None,
    task: str,
    capability: str,
    provider: str,
    model: str,
    status: Status,
    latency_ms: int,
    input_tokens: int,
    output_tokens: int,
    est_cost_usd: float,
    cache_hit: bool,
    error_text: str | None = None,
) -> None:
    async with session_scope() as session:
        await session.execute(
            text(
                """
                INSERT INTO model_calls (
                  run_id, task, capability, provider, model, status,
                  latency_ms, input_tokens, output_tokens, est_cost_usd,
                  cache_hit, error_text
                ) VALUES (
                  :run_id, :task, :capability, :provider, :model, :status,
                  :latency_ms, :input_tokens, :output_tokens, :est_cost_usd,
                  :cache_hit, :error_text
                )
                """
            ),
            {
                "run_id": run_id,
                "task": task,
                "capability": capability,
                "provider": provider,
                "model": model,
                "status": status,
                "latency_ms": latency_ms,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "est_cost_usd": round(est_cost_usd, 5),
                "cache_hit": cache_hit,
                "error_text": (error_text or "")[:500] or None,
            },
        )