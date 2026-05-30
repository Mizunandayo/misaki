"""Wrapped Bright Data MCP call. Every node in Graphs 2 and 3 must use
this — direct calls to mcp.client bypass tracing/caching/event publishing.

For each call:
  1. Build deterministic cache key from (tool_name, sorted args).
  2. If Redis has the result: publish ACT(cached) + OBSERVE(cached, latency=0),
     bump the run's MCP counter (no credit charge), return cached payload.
  3. Otherwise: publish ACT(live), invoke the tool via mcp.client, publish
     OBSERVE(latency, bytes), bump counter (1 cent placeholder), cache the
     result for 24 h.
  4. Errors publish ERROR event then re-raise.

Credit estimation is a placeholder (1 cent / non-cached call). Refine
post-hackathon from Bright Data invoices.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import time
import uuid
from typing import Any

import redis.asyncio as aioredis
from langfuse import observe
from sqlalchemy import text

from app.ai import circuit_breaker as cb
from app.ai.cache import _client
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.client import get_mcp_tools
from app.mcp.events import EventType, publish_event

log = get_logger(__name__)

DEFAULT_TTL = 86_400
APPROX_CREDIT_CENTS = 1
# Per-tool wall-clock ceiling. Sized for the slowest healthy Bright Data path
# (large 10-K filing scrape) while still bounding the demo to a predictable
# upper bound. Override via the `timeout` arg for unusually heavy calls.
DEFAULT_TOOL_TIMEOUT_SECONDS = 25.0


def _tool_cache_key(tool_name: str, args: dict[str, Any]) -> str:
    blob = json.dumps({"t": tool_name, "a": args}, sort_keys=True, default=str)
    h = hashlib.sha256(blob.encode("utf-8")).hexdigest()[:40]
    return f"mcp:{tool_name}:{h}"


def _unwrap_mcp_content(result: Any) -> Any:
    """Bright Data MCP returns scraped/SERP content wrapped in
    `[{'type': 'text', 'text': '...', 'id': '...'}, ...]` envelopes.

    Downstream callers expect plain strings (for scrape_as_markdown) or
    structured dicts (for search_engine). Coerce here so no caller has to
    know about the envelope shape, and so the synthesis prompt receives
    actual markdown — not Python repr noise.

    Rules:
      - list of {'type': 'text', 'text': str} → concat the 'text' fields
      - list of dicts (no text envelope) → leave as-is (e.g. SERP results)
      - dict / str → leave as-is
    """
    if isinstance(result, list) and result:
        looks_like_text_envelope = all(
            isinstance(item, dict) and item.get("type") == "text"
            for item in result
        )
        if looks_like_text_envelope:
            return "".join(
                str(item.get("text") or "") for item in result
            )
    return result


async def _bump_run_meter(run_id: uuid.UUID, *, cached: bool) -> None:
    delta = 0 if cached else APPROX_CREDIT_CENTS
    async with session_scope() as session:
        await session.execute(
            text(
                """
                UPDATE agent_runs
                   SET total_mcp_calls = total_mcp_calls + 1,
                       total_credit_cents = total_credit_cents + :d
                 WHERE id = :rid
                """
            ),
            {"rid": run_id, "d": delta},
        )


@observe(name="mcp.toolbox.call")
async def call_tool(
    *,
    run_id: uuid.UUID,
    tool_name: str,
    args: dict[str, Any],
    summarize: str | None = None,
    timeout: float | None = None,
) -> Any:
    key = _tool_cache_key(tool_name, args)
    r: aioredis.Redis = _client()
    wall_clock_ceiling = timeout if timeout is not None else DEFAULT_TOOL_TIMEOUT_SECONDS

    cached_raw = await r.get(key)
    if cached_raw is not None:
        await publish_event(
            run_id,
            EventType.ACT,
            {"tool": tool_name, "args": args, "summary": summarize},
            cached=True,
        )
        result = json.loads(cached_raw)
        await publish_event(
            run_id,
            EventType.OBSERVE,
            {"tool": tool_name, "result_bytes": len(cached_raw), "latency_ms": 0},
            cached=True,
        )
        await _bump_run_meter(run_id, cached=True)
        return result

    # Daily live-call cap — protects the Bright Data coupon budget from being
    # drained by abuse of the public scanner/agent endpoints. Cached hits above
    # never reach here, so legitimate repeat traffic is unaffected.
    if await cb.brightdata_calls_remaining() <= 0:
        await publish_event(
            run_id,
            EventType.ERROR,
            {"tool": tool_name, "error": "brightdata_daily_cap_reached"},
        )
        raise RuntimeError(
            "Bright Data daily call cap reached — live web scraping is paused "
            "until reset to protect the shared budget."
        )
    await cb.record_brightdata_call()

    await publish_event(
        run_id,
        EventType.ACT,
        {"tool": tool_name, "args": args, "summary": summarize},
    )

    tools = await get_mcp_tools()
    tool = next((t for t in tools if t.name == tool_name), None)
    if tool is None:
        await publish_event(
            run_id,
            EventType.ERROR,
            {"tool": tool_name, "error": "tool_not_found"},
        )
        raise RuntimeError(f"MCP tool not found: {tool_name}")

    t0 = time.perf_counter()
    try:
        result = await asyncio.wait_for(tool.ainvoke(args), timeout=wall_clock_ceiling)
    except asyncio.TimeoutError:
        latency_ms = int((time.perf_counter() - t0) * 1000)
        await publish_event(
            run_id,
            EventType.ERROR,
            {
                "tool": tool_name,
                "error": "timeout",
                "ceiling_seconds": wall_clock_ceiling,
                "latency_ms": latency_ms,
            },
        )
        # Bump the call meter (we did spend the upstream credit) but skip
        # caching — a timeout is not a result we want to memoize.
        await _bump_run_meter(run_id, cached=False)
        raise TimeoutError(
            f"MCP tool '{tool_name}' exceeded {wall_clock_ceiling:.0f}s ceiling"
        )
    except Exception as exc:
        await publish_event(
            run_id,
            EventType.ERROR,
            {"tool": tool_name, "error": str(exc)[:300]},
        )
        raise

    latency_ms = int((time.perf_counter() - t0) * 1000)
    # Unwrap Bright Data's text-content envelope BEFORE caching so that the
    # cache and downstream callers see the actual scraped markdown / SERP
    # payload, not a list of {'type':'text','text':'...'} wrappers.
    result = _unwrap_mcp_content(result)
    # MCP results vary by tool — coerce to str|list|dict so json.dumps works.
    serializable = result if isinstance(result, (str, list, dict)) else str(result)
    payload = json.dumps(serializable, default=str)
    await r.setex(key, DEFAULT_TTL, payload)

    await publish_event(
        run_id,
        EventType.OBSERVE,
        {
            "tool": tool_name,
            "result_bytes": len(payload),
            "latency_ms": latency_ms,
        },
    )
    await _bump_run_meter(run_id, cached=False)
    return serializable
