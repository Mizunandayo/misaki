from __future__ import annotations
import asyncio
import json
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, TypedDict, cast
from langfuse import observe
from langgraph.graph import END, START, StateGraph
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason
from app.ai.guards import wrap_untrusted
from app.ai.prompts_scanner import (
    SCANNER_SYNTHESIS_SYSTEM,
    SCANNER_SYNTHESIS_USER,
)
from app.ai.schemas_scanner import ScannerReport
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.events import EventType, publish_event
from app.mcp.toolbox import call_tool
from app.services.agent_run import mark_failed, mark_step, mark_succeeded







log = get_logger(__name__)


REPORT_TTL_DAYS = 7
MAX_PRESS_HITS = 8
MAX_PAGE_CHARS = 6_000







EDGAR_FULLTEXT = (
    "https://efts.sec.gov/LATEST/search-index?q=%22{q}%22&dateRange=custom"
    "&startdt={start}&enddt={end}&forms=10-K"
)









# State


class ScannerState(TypedDict, total=False):
    run_id: uuid.UUID
    company_name: str
    company_name_normalized: str

    sec_text: str
    press_hits: list[dict[str, Any]]
    lobbying_rows: list[dict[str, Any]]

    report: ScannerReport
    report_id: uuid.UUID
    error: str | None



# Parallel ingestion node


def _truncate(s: str, n: int) -> str:
    return s if len(s) <= n else (s[:n] + "\n…[truncated]")


async def _fetch_sec(run_id: uuid.UUID, name: str) -> str:
    """Use the Bright Data assistant tool to pull the latest 10-K Risk Factors.

    EDGAR full-text search returns links to the actual filing. We surface the
    Risk Factors paragraph from the FIRST matching filing.
    """
    await publish_event(
        run_id, EventType.THINK,
        {"kind": "scanner_step", "node": "sec_edgar",
         "text": f"Pulling SEC 10-K Risk Factors for {name}"},
    )
    today = datetime.now(timezone.utc).date()
    start = (today - timedelta(days=730)).isoformat()
    end = today.isoformat()
    search_url = EDGAR_FULLTEXT.format(
        q=name.replace(" ", "+"), start=start, end=end,
    )
    try:
        index = await call_tool(
            run_id=run_id,
            tool_name="scrape_as_markdown",
            args={"url": search_url},
            summarize=f"EDGAR full-text search for {name}",
        )
    except Exception as exc:
        log.warning("scanner_edgar_index_failed", err=str(exc))
        return ""

    index_str = index if isinstance(index, str) else str(index)
    m = re.search(r"https?://www\.sec\.gov/Archives/edgar/[^\s)]+", index_str)
    if not m:
        return _truncate(index_str, MAX_PAGE_CHARS)

    filing_url = m.group(0)
    try:
        filing = await call_tool(
            run_id=run_id,
            tool_name="scrape_as_markdown",
            args={"url": filing_url},
            summarize=f"Scraping 10-K filing {filing_url[-40:]}",
        )
    except Exception as exc:
        log.warning("scanner_edgar_filing_failed", err=str(exc), url=filing_url)
        return ""

    filing_str = filing if isinstance(filing, str) else str(filing)
    # Try to slice to Risk Factors section if present
    rf = re.search(
        r"(?is)(item\s*1a[.\s]*risk\s*factors.{0,200}?)(item\s*1b|item\s*2)",
        filing_str,
    )
    if rf:
        block = rf.group(1)
    else:
        block = filing_str
    return _truncate(block.strip(), MAX_PAGE_CHARS)


async def _fetch_press(run_id: uuid.UUID, name: str) -> list[dict[str, Any]]:
    await publish_event(
        run_id, EventType.THINK,
        {"kind": "scanner_step", "node": "press_sweep",
         "text": f"Searching press / blog mentions of {name} on compliance"},
    )
    query = (
        f'"{name}" (regulatory OR compliance OR lobbying OR "AI Act" OR '
        f'GDPR OR CCPA OR SEC) site:* -filetype:pdf'
    )
    try:
        serp = await call_tool(
            run_id=run_id,
            tool_name="search_engine",
            args={"query": query, "engine": "google"},
            summarize="SERP for press / blog compliance hits",
        )
    except Exception as exc:
        log.warning("scanner_press_failed", err=str(exc))
        return []

    items: list[dict[str, Any]] = []
    raw_results = []
    if isinstance(serp, dict):
        raw_results = serp.get("organic_results") or serp.get("results") or []
    elif isinstance(serp, list):
        raw_results = serp

    for r in list(raw_results)[:MAX_PRESS_HITS]:
        if not isinstance(r, dict):
            continue
        url = r.get("link") or r.get("url")
        title = r.get("title") or ""
        snippet = r.get("snippet") or r.get("description") or ""
        if url:
            items.append({"url": url, "title": title[:200], "snippet": snippet[:400]})
    return items


async def _fetch_lobbying(run_id: uuid.UUID, name: str) -> list[dict[str, Any]]:
    await publish_event(
        run_id, EventType.THINK,
        {"kind": "scanner_step", "node": "lobbying_lookup",
         "text": f"Cross-referencing OpenSecrets for {name}"},
    )
    url = (
        "https://www.opensecrets.org/federal-lobbying/clients/summary"
        f"?id={name.replace(' ', '%20')}"
    )
    try:
        page = await call_tool(
            run_id=run_id,
            tool_name="scrape_as_markdown",
            args={"url": url},
            summarize=f"OpenSecrets lookup for {name}",
        )
    except Exception as exc:
        log.warning("scanner_lobbying_failed", err=str(exc))
        return []
    page_str = page if isinstance(page, str) else str(page)
    # Heuristic row extraction — the synthesis model handles soft fields.
    rows: list[dict[str, Any]] = []
    for m in re.finditer(r"\$([\d,]{4,})\s+[\-—–]?\s*(\d{4})\s+([A-Z][^\n]{0,80})", page_str):
        rows.append({
            "amount_usd": int(m.group(1).replace(",", "")),
            "year": int(m.group(2)),
            "issue_or_client": m.group(3).strip()[:80],
        })
        if len(rows) >= 20:
            break
    if not rows:
        # Pass the raw page if parsing failed; synthesis model can still reason
        rows = [{"raw_excerpt": _truncate(page_str, 2400)}]
    return rows


@observe(name="graph3.parallel_ingest")
async def parallel_ingest_node(state: ScannerState) -> dict[str, Any]:
    run_id = state["run_id"]
    name = state["company_name"]
    await mark_step(run_id, step="ingest")

    sec_text, press_hits, lobbying_rows = await asyncio.gather(
        _fetch_sec(run_id, name),
        _fetch_press(run_id, name),
        _fetch_lobbying(run_id, name),
    )
    return {
        "sec_text": sec_text,
        "press_hits": press_hits,
        "lobbying_rows": lobbying_rows,
    }



# Synthesis node


@observe(name="graph3.synthesize")
async def synthesize_node(state: ScannerState) -> dict[str, Any]:
    run_id = state["run_id"]
    await mark_step(run_id, step="synthesize")

    sec_block = wrap_untrusted(state.get("sec_text") or "(none)", source="sec.gov/edgar")

    press_lines: list[str] = []
    for h in state.get("press_hits", []):
        press_lines.append(
            f"- {h.get('title','')}\n  {h.get('url','')}\n  {h.get('snippet','')}"
        )
    press_block = wrap_untrusted(
        "\n".join(press_lines) or "(no press hits)",
        source="serp/press",
    )

    lobbying_block = wrap_untrusted(
        json.dumps(state.get("lobbying_rows", []), default=str)[:6000],
        source="opensecrets.org",
    )

    report = await reason(
        task="scanner_synthesis",
        capability=Capability.DEEP_REASONING,
        schema=ScannerReport,
        system_prompt=SCANNER_SYNTHESIS_SYSTEM,
        user_prompt=SCANNER_SYNTHESIS_USER.format(
            company_name=state["company_name"],
            company_name_normalized=state["company_name_normalized"],
            sec_block=sec_block,
            press_count=len(state.get("press_hits", [])),
            press_block=press_block,
            lobbying_block=lobbying_block,
        ),
        run_id=run_id,
    )
    return {"report": report}



# Persistence


async def persist_report(state: ScannerState) -> uuid.UUID | None:
    if state.get("error") or not state.get("report"):
        return None
    rpt = state["report"]
    run_id = state["run_id"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=REPORT_TTL_DAYS)

    async with session_scope() as session:
        report_id = (
            await session.execute(
                text(
                    """
                    INSERT INTO scanner_reports (
                      company_name_normalized, company_name_display,
                      exposure_score, total_exposure_low_usd, total_exposure_high_usd,
                      top_threats, strategic_summary, raw_sec_excerpt,
                      model_breakdown, run_id, expires_at
                    ) VALUES (
                      :norm, :disp, :score, :lo, :hi,
                      CAST(:threats AS jsonb), :summary, :sec,
                      CAST(:models AS jsonb), :rid, :exp
                    )
                    ON CONFLICT (company_name_normalized) DO UPDATE SET
                      company_name_display = EXCLUDED.company_name_display,
                      exposure_score = EXCLUDED.exposure_score,
                      total_exposure_low_usd = EXCLUDED.total_exposure_low_usd,
                      total_exposure_high_usd = EXCLUDED.total_exposure_high_usd,
                      top_threats = EXCLUDED.top_threats,
                      strategic_summary = EXCLUDED.strategic_summary,
                      raw_sec_excerpt = EXCLUDED.raw_sec_excerpt,
                      run_id = EXCLUDED.run_id,
                      expires_at = EXCLUDED.expires_at,
                      created_at = NOW()
                    RETURNING id
                    """
                ),
                {
                    "norm": rpt.company_name_normalized,
                    "disp": rpt.company_name,
                    "score": rpt.exposure_score,
                    "lo": rpt.total_exposure_low_usd,
                    "hi": rpt.total_exposure_high_usd,
                    "threats": json.dumps(
                        [t.model_dump(mode="json") for t in rpt.top_threats]
                    ),
                    "summary": rpt.strategic_summary,
                    "sec": rpt.raw_sec_excerpt,
                    "models": json.dumps({}),  # filled by Day 4 Model Router panel
                    "rid": run_id,
                    "exp": expires_at,
                },
            )
        ).scalar_one()
    return report_id



# Graph wiring + runner


def build_graph():
    g = StateGraph(ScannerState)
    g.add_node("ingest", parallel_ingest_node)
    g.add_node("synthesize", synthesize_node)
    g.add_edge(START, "ingest")
    g.add_edge("ingest", "synthesize")
    g.add_edge("synthesize", END)
    return g.compile()


GRAPH = build_graph()


async def run_scanner(
    *,
    run_id: uuid.UUID,
    company_name: str,
    company_name_normalized: str,
) -> uuid.UUID | None:
    initial: ScannerState = {
        "run_id": run_id,
        "company_name": company_name,
        "company_name_normalized": company_name_normalized,
    }
    try:
        final = cast(ScannerState, await GRAPH.ainvoke(initial))
        report_id = await persist_report(final)
        await mark_succeeded(run_id)
        await publish_event(
            run_id, EventType.CONCLUDE,
            {
                "kind": "scanner_complete",
                "report_id": str(report_id) if report_id else None,
                "exposure_score": final["report"].exposure_score if final.get("report") else None,
            },
        )
        return report_id
    except Exception as exc:
        log.exception("scanner_failed", run_id=str(run_id))
        await mark_failed(run_id, error=str(exc))
        await publish_event(
            run_id, EventType.ERROR,
            {"kind": "scanner_failed", "text": str(exc)[:300]},
        )
        return None