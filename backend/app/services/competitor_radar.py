"""Per-competitor signal collection for a tracked bill."""

from __future__ import annotations
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any
from sqlalchemy import text
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.toolbox import call_tool

log = get_logger(__name__)











async def _linkedin_jobs(run_id: uuid.UUID, competitor: str, domain: str) -> list[dict[str, Any]]:
    serp = await call_tool(
        run_id=run_id,
        tool_name="search_engine",
        args={
            "query": f'site:linkedin.com/jobs "{competitor}" ("compliance" OR "regulatory" OR "{domain}")',
            "engine": "google",
        },
        summarize=f"LinkedIn jobs — {competitor}",
    )
    out: list[dict[str, Any]] = []
    raw = (serp.get("organic_results") if isinstance(serp, dict) else serp) or []
    for r in list(raw)[:6]:
        if not isinstance(r, dict):
            continue
        url = r.get("link") or r.get("url")
        if not url:
            continue
        out.append({
            "type": "linkedin_job",
            "url": url,
            "summary": (r.get("title") or "")[:200],
        })
    return out


async def _press_hits(run_id: uuid.UUID, competitor: str, bill_number: str) -> list[dict[str, Any]]:
    serp = await call_tool(
        run_id=run_id,
        tool_name="search_engine",
        args={
            "query": f'"{competitor}" "{bill_number}" OR statement OR response 2026',
            "engine": "google",
        },
        summarize=f"Press hits — {competitor} / {bill_number}",
    )
    out: list[dict[str, Any]] = []
    raw = (serp.get("organic_results") if isinstance(serp, dict) else serp) or []
    for r in list(raw)[:6]:
        if not isinstance(r, dict):
            continue
        url = r.get("link") or r.get("url")
        if not url:
            continue
        out.append({
            "type": "press",
            "url": url,
            "summary": (r.get("snippet") or r.get("title") or "")[:400],
        })
    return out


async def _edgar_risk(run_id: uuid.UUID, competitor: str) -> list[dict[str, Any]]:
    url = (
        "https://efts.sec.gov/LATEST/search-index?q="
        + competitor.replace(" ", "+")
        + "+regulatory+risk&forms=10-Q"
    )
    page = await call_tool(
        run_id=run_id,
        tool_name="scrape_as_markdown",
        args={"url": url},
        summarize=f"EDGAR risk — {competitor}",
    )
    if not isinstance(page, str):
        return []
    return [{"type": "edgar_risk", "url": url, "summary": page[:400]}]


async def refresh_for_competitor(
    *,
    run_id: uuid.UUID,
    bill_id: uuid.UUID,
    bill_number: str,
    domain: str,
    competitor: str,
) -> int:
    jobs, press, edgar = await asyncio.gather(
        _linkedin_jobs(run_id, competitor, domain),
        _press_hits(run_id, competitor, bill_number),
        _edgar_risk(run_id, competitor),
        return_exceptions=False,
    )
    signals = jobs + press + edgar
    if not signals:
        return 0

    now = datetime.now(timezone.utc)
    async with session_scope() as session:
        for sig in signals:
            await session.execute(
                text(
                    """
                    INSERT INTO competitor_signals
                       (bill_id, competitor_name, signal_type,
                        signal_date, source_url, summary)
                    VALUES (:bid, :name, :stype, :sdate, :url, :sum)
                    """
                ),
                {
                    "bid": bill_id,
                    "name": competitor[:160],
                    "stype": sig["type"],
                    "sdate": now,
                    "url": sig["url"],
                    "sum": sig["summary"],
                },
            )
    return len(signals)
