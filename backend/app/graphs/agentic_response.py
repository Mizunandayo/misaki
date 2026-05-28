"""LangGraph Graph 2 — Autonomous Agentic Response."""


from __future__ import annotations
import json
import uuid
from typing import Any, TypedDict, cast
from langfuse import observe
from langgraph.graph import END, START, StateGraph
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason
from app.ai.guards import wrap_untrusted
from app.ai.prompts_agentic import (
    BRIEF_DRAFT_SYSTEM,
    BRIEF_DRAFT_USER,
    COMPETITIVE_STRATEGY_SYSTEM,
    COMPETITIVE_STRATEGY_USER,
    EXEC_SUMMARY_SYSTEM,
    EXEC_SUMMARY_USER,
    LAW_FIRM_SYNTHESIS_SYSTEM,
    LAW_FIRM_SYNTHESIS_USER,
)
from app.ai.schemas_agentic import (
    ActionPackage,
    CompetitiveResponseStrategy,
    LawFirmBundle,
    LobbyistBriefDraft,
)
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.events import EventType, publish_event
from app.mcp.toolbox import call_tool
from app.services.agent_run import mark_failed, mark_step, mark_succeeded

log = get_logger(__name__)






MAX_PAGE_CHARS = 8_000
MAX_FIRM_PAGES_TOTAL = 5
MAX_COMPETITOR_PAGES_TOTAL = 6






# Shared state

class AgenticState(TypedDict, total=False):
    run_id: uuid.UUID
    bill_id: uuid.UUID
    company_id: uuid.UUID
    bill: dict[str, Any]
    profile: dict[str, Any]
    verdict: dict[str, Any]
    precedents: list[dict[str, Any]]
    domain: str
    firms: LawFirmBundle
    brief: LobbyistBriefDraft
    strategy: CompetitiveResponseStrategy
    executive_summary: str
    error: str | None











# Helpers

def _truncate(s: str, n: int) -> str:
    return s if len(s) <= n else (s[:n] + "\n…[truncated]")


def _bill_domain(bill: dict[str, Any]) -> str:
    """Derive a coarse domain label for SERP queries. Cheap, deterministic."""
    title = (bill.get("title") or "").lower()
    if any(k in title for k in ("ai", "artificial intelligence", "algorithm")):
        return "AI governance"
    if any(k in title for k in ("privacy", "data protection", "consumer data", "personal information")):
        return "data privacy"
    if any(k in title for k in ("financial", "consumer credit", "banking")):
        return "financial services"
    if any(k in title for k in ("health", "patient", "medical")):
        return "healthcare compliance"
    return "regulatory compliance"


async def _load_context(state: AgenticState) -> dict[str, Any]:
    """Pulls bill, company, latest assessment verdict, precedents."""
    bill_id = state["bill_id"]
    company_id = state["company_id"]

    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    SELECT id, jurisdiction, bill_number, title, full_text, status
                      FROM bills WHERE id = :bid
                    """
                ),
                {"bid": bill_id},
            )
        ).mappings().first()
        if row is None:
            return {"error": f"Bill {bill_id} not found"}

        profile_row = (
            await session.execute(
                text(
                    """
                    SELECT id, name, industry_tags, jurisdictions, headcount,
                           revenue_band, data_handling_classification,
                           compliance_certifications
                      FROM company_profiles WHERE id = :cid
                    """
                ),
                {"cid": company_id},
            )
        ).mappings().first()
        if profile_row is None:
            return {"error": f"Company {company_id} not found"}

        verdict_row = (
            await session.execute(
                text(
                    """
                    SELECT verdict, confidence, reasoning_chain,
                           triggering_clause_text, triggering_clause_location,
                           compliance_cost_estimate, affected_operations,
                           comparable_bills
                      FROM assessments
                     WHERE bill_id = :bid AND company_id = :cid
                    """
                ),
                {"bid": bill_id, "cid": company_id},
            )
        ).mappings().first()
        if verdict_row is None:
            return {
                "error": (
                    f"No assessment for bill {bill_id} / company {company_id} — "
                    "run Graph 1 first."
                )
            }

    bill_dict = {
        "id": str(row["id"]),
        "jurisdiction": row["jurisdiction"],
        "bill_number": row["bill_number"],
        "title": row["title"],
        "full_text": row["full_text"] or "",
        "status": row["status"],
    }
    profile_dict = dict(profile_row)
    profile_dict["id"] = str(profile_dict["id"])
    verdict_dict = dict(verdict_row)

    return {
        "bill": bill_dict,
        "profile": profile_dict,
        "verdict": verdict_dict,
        "precedents": verdict_dict.get("comparable_bills") or [],
        "domain": _bill_domain(bill_dict),
    }





















# Node 1 Law Firm Discovery


@observe(name="graph2.law_firm_discovery")
async def law_firm_discovery_node(state: AgenticState) -> dict[str, Any]:
    if state.get("error"):
        return {}
    run_id = state["run_id"]
    await mark_step(run_id, step="law_firm_discovery")

    bill = state["bill"]
    domain = state["domain"]
    query = (
        f"top {domain} law firms {bill['jurisdiction']} accepting clients "
        f"{bill['bill_number']} compliance advisory"
    )
    

    await publish_event(
        run_id, EventType.THINK,
        {
            "kind": "node_start",
            "node": "law_firm_discovery",
            "text": f"Searching for {domain} firms in {bill['jurisdiction']}",
        },
    )



    # 1. SERP search (cached 24h by query)
    serp = await call_tool(
        run_id=run_id,
        tool_name="search_engine",
        args={"query": query, "engine": "google"},
        summarize=f"Search top {domain} firms in {bill['jurisdiction']}",
    )




    # SERP responses vary by version — try the common shapes.
    urls: list[str] = []
    if isinstance(serp, dict):
        for r in (serp.get("organic_results") or serp.get("results") or [])[:8]:
            url = r.get("link") or r.get("url")
            if url:
                urls.append(url)
    elif isinstance(serp, list):
        for r in serp[:8]:
            if isinstance(r, dict):
                url = r.get("link") or r.get("url")
                if url:
                    urls.append(url)

    urls = urls[:MAX_FIRM_PAGES_TOTAL]



    # 2. Scrape each top firm — parallel via gather() is tempting but the
    #    sequential pattern keeps the terminal stream linear and human-readable.
    firm_pages_block_parts: list[str] = []
    for url in urls:
        try:
            page = await call_tool(
                run_id=run_id,
                tool_name="scrape_as_markdown",
                args={"url": url},
                summarize=f"Scraping {url}",
            )
        except Exception as exc:
            log.warning("firm_scrape_failed", url=url, err=str(exc))
            continue
        if not isinstance(page, str):
            page = str(page)
        firm_pages_block_parts.append(
            wrap_untrusted(_truncate(page, MAX_PAGE_CHARS), source=url)
        )

    firm_pages_block = "\n\n".join(firm_pages_block_parts) or "No pages scraped."



    # 3. Synthesize via Pro
    bundle = await reason(
        task="law_firm_synthesis",
        capability=Capability.DEEP_REASONING,
        schema=LawFirmBundle,
        system_prompt=LAW_FIRM_SYNTHESIS_SYSTEM,
        user_prompt=LAW_FIRM_SYNTHESIS_USER.format(
            jurisdiction=bill["jurisdiction"],
            bill_number=bill["bill_number"],
            title=bill["title"],
            domain=domain,
            query=query,
            firm_pages_block=firm_pages_block,
        ),
        run_id=run_id,
    )

    await publish_event(
        run_id, EventType.CONCLUDE,
        {
            "kind": "node_complete",
            "node": "law_firm_discovery",
            "summary": f"{len(bundle.firms)} firms shortlisted",
            "firms": [f.model_dump(mode="json") for f in bundle.firms],
        },
    )
    return {"firms": bundle}








# Node 2 — Lobbyist Brief Draft


@observe(name="graph2.lobbyist_brief")
async def lobbyist_brief_node(state: AgenticState) -> dict[str, Any]:
    if state.get("error"):
        return {}
    run_id = state["run_id"]
    await mark_step(run_id, step="lobbyist_brief")

    bill = state["bill"]
    profile = state["profile"]
    verdict = state["verdict"]
    precedents = state.get("precedents", [])

    precedent_block = (
        "\n".join(
            f"- {p.get('jurisdiction','?')} {p.get('bill_number','?')}: "
            f"{p.get('title','?')}"
            for p in precedents
        )
        or "No semantically similar precedents on record."
    )

    await publish_event(
        run_id, EventType.THINK,
        {
            "kind": "node_start",
            "node": "lobbyist_brief",
            "text": "Drafting formal lobbyist response brief",
        },
    )

    brief = await reason(
        task="lobbyist_brief_draft",
        capability=Capability.LONG_FORM_PROSE,
        schema=LobbyistBriefDraft,
        system_prompt=BRIEF_DRAFT_SYSTEM,
        user_prompt=BRIEF_DRAFT_USER.format(
            profile_json=json.dumps(
                {
                    k: v for k, v in profile.items()
                    if k not in {"id"}
                },
                ensure_ascii=False, default=str,
            ),
            verdict_json=json.dumps(verdict, ensure_ascii=False, default=str),
            jurisdiction=bill["jurisdiction"],
            bill_number=bill["bill_number"],
            title=bill["title"],
            bill_text=_truncate(bill["full_text"], 24_000),
            precedent_block=precedent_block,
        ),
        run_id=run_id,
    )

    await publish_event(
        run_id, EventType.CONCLUDE,
        {
            "kind": "node_complete",
            "node": "lobbyist_brief",
            "summary": brief.one_line_position,
        },
    )
    return {"brief": brief}



# Node 3 — Competitive Response Strategy


@observe(name="graph2.competitive_strategy")
async def competitive_strategy_node(state: AgenticState) -> dict[str, Any]:
    if state.get("error"):
        return {}
    run_id = state["run_id"]
    await mark_step(run_id, step="competitive_strategy")

    bill = state["bill"]
    profile = state["profile"]
    precedents = state.get("precedents") or []
    precedent_bill_label = (
        f"{precedents[0].get('jurisdiction')} {precedents[0].get('bill_number')} — {precedents[0].get('title')}"
        if precedents
        else "No semantically similar precedents on record."
    )
    precedent_query_seed = (
        precedents[0].get("bill_number", "") if precedents else ""
    )

    await publish_event(
        run_id, EventType.THINK,
        {
            "kind": "node_start",
            "node": "competitive_strategy",
            "text": "Searching competitor public response to precedent legislation",
        },
    )

    # Identify the company's industry signature for the search
    industry_signature = (
        ", ".join((profile.get("industry_tags") or [])[:3])
        or "SaaS data processor"
    )
    query = (
        f"how did {industry_signature} companies respond to "
        f"{precedent_query_seed or precedent_bill_label} — public statements, "
        f"compliance engineering, lobbying"
    )

    serp = await call_tool(
        run_id=run_id,
        tool_name="search_engine",
        args={"query": query, "engine": "google"},
        summarize="Search competitor response to precedent",
    )

    urls: list[str] = []
    if isinstance(serp, dict):
        for r in (serp.get("organic_results") or serp.get("results") or [])[:MAX_COMPETITOR_PAGES_TOTAL]:
            url = r.get("link") or r.get("url")
            if url:
                urls.append(url)
    elif isinstance(serp, list):
        for r in serp[:MAX_COMPETITOR_PAGES_TOTAL]:
            if isinstance(r, dict):
                url = r.get("link") or r.get("url")
                if url:
                    urls.append(url)

    competitor_block_parts: list[str] = []
    for url in urls:
        try:
            page = await call_tool(
                run_id=run_id,
                tool_name="scrape_as_markdown",
                args={"url": url},
                summarize=f"Scraping {url}",
            )
        except Exception as exc:
            log.warning("competitor_scrape_failed", url=url, err=str(exc))
            continue
        if not isinstance(page, str):
            page = str(page)
        competitor_block_parts.append(
            wrap_untrusted(_truncate(page, MAX_PAGE_CHARS), source=url)
        )
    competitor_block = "\n\n".join(competitor_block_parts) or "No pages scraped."

    strategy = await reason(
        task="competitive_strategy",
        capability=Capability.DEEP_REASONING,
        schema=CompetitiveResponseStrategy,
        system_prompt=COMPETITIVE_STRATEGY_SYSTEM,
        user_prompt=COMPETITIVE_STRATEGY_USER.format(
            profile_json=json.dumps(
                {k: v for k, v in profile.items() if k != "id"},
                ensure_ascii=False, default=str,
            ),
            jurisdiction=bill["jurisdiction"],
            bill_number=bill["bill_number"],
            title=bill["title"],
            precedent_bill=precedent_bill_label,
            competitor_block=competitor_block,
        ),
        run_id=run_id,
    )

    await publish_event(
        run_id, EventType.CONCLUDE,
        {
            "kind": "node_complete",
            "node": "competitive_strategy",
            "summary": strategy.recommended_play,
            "moves": [m.model_dump(mode="json") for m in strategy.competitor_moves],
        },
    )
    return {"strategy": strategy}



# Node 4 — Action Package assembly


class _ExecSummaryEnvelope(LobbyistBriefDraft):
    """Reused only for the gateway repair loop — we want exec summary alone."""


@observe(name="graph2.action_package")
async def action_package_node(state: AgenticState) -> dict[str, Any]:
    if state.get("error"):
        return {}
    run_id = state["run_id"]
    await mark_step(run_id, step="action_package")

    firms = state["firms"]
    brief = state["brief"]
    strategy = state["strategy"]
    bill = state["bill"]
    verdict = state["verdict"]

    firms_block = "\n".join(
        f"- {f.name} ({f.jurisdiction}) — {f.headline}"
        for f in firms.firms
    ) or "No firms shortlisted."

    # Single-field schema for the executive summary.
    from pydantic import BaseModel, Field

    class _ExecSummary(BaseModel):
        executive_summary: str = Field(min_length=80, max_length=900)

    await publish_event(
        run_id, EventType.THINK,
        {
            "kind": "node_start",
            "node": "action_package",
            "text": "Assembling executive summary and final package",
        },
    )

    summary = await reason(
        task="action_package_exec_summary",
        capability=Capability.LONG_FORM_PROSE,
        schema=_ExecSummary,
        system_prompt=EXEC_SUMMARY_SYSTEM,
        user_prompt=EXEC_SUMMARY_USER.format(
            firms_block=firms_block,
            brief_position=brief.one_line_position,
            recommended_play=strategy.recommended_play,
            strategy_summary=strategy.recommendation_summary,
            jurisdiction=bill["jurisdiction"],
            bill_number=bill["bill_number"],
            title=bill["title"],
            compliance_cost_usd=int(verdict.get("compliance_cost_estimate") or 0),
        ),
        run_id=run_id,
    )

    await publish_event(
        run_id, EventType.CONCLUDE,
        {
            "kind": "node_complete",
            "node": "action_package",
            "summary": summary.executive_summary,
        },
    )
    return {"executive_summary": summary.executive_summary}



# Persistence


async def persist_action_package(state: AgenticState) -> uuid.UUID | None:
    if state.get("error"):
        return None
    run_id = state["run_id"]
    bill_id = state["bill_id"]
    company_id = state["company_id"]

    pkg = ActionPackage(
        bill_id=str(bill_id),
        company_id=str(company_id),
        law_firms=state["firms"],
        lobbyist_brief=state["brief"],
        competitive_strategy=state["strategy"],
        executive_summary=state["executive_summary"],
    )
    payload_json = pkg.model_dump(mode="json")
    brief_text = "\n\n".join(
        f"## {s.heading}\n{s.body_markdown}" for s in pkg.lobbyist_brief.sections
    )

    async with session_scope() as session:
        row_id = (
            await session.execute(
                text(
                    """
                    INSERT INTO action_packages (
                      bill_id, company_id, run_id,
                      law_firm_shortlist, lobbyist_brief_draft,
                      competitive_response, payload
                    ) VALUES (
                      :bid, :cid, :rid,
                      CAST(:firms AS jsonb), :brief,
                      :strategy, CAST(:payload AS jsonb)
                    )
                    RETURNING id
                    """
                ),
                {
                    "bid": bill_id,
                    "cid": company_id,
                    "rid": run_id,
                    "firms": json.dumps(
                        [f.model_dump(mode="json") for f in pkg.law_firms.firms]
                    ),
                    "brief": brief_text,
                    "strategy": pkg.competitive_strategy.recommendation_summary,
                    "payload": json.dumps(payload_json),
                },
            )
        ).scalar_one()
    return row_id



# Graph wiring + runner


@observe(name="graph2.ingest_context")
async def ingest_node(state: AgenticState) -> dict[str, Any]:
    ctx = await _load_context(state)
    if "error" in ctx:
        await publish_event(
            state["run_id"], EventType.ERROR,
            {"kind": "ingest_failed", "text": ctx["error"]},
        )
    return ctx


def build_graph():
    g = StateGraph(AgenticState)
    g.add_node("ingest", ingest_node)
    g.add_node("law_firms", law_firm_discovery_node)
    g.add_node("brief", lobbyist_brief_node)
    g.add_node("strategy", competitive_strategy_node)
    g.add_node("package", action_package_node)

    g.add_edge(START, "ingest")
    g.add_conditional_edges(
        "ingest",
        lambda s: END if s.get("error") else "law_firms",
        ["law_firms", END],
    )
    g.add_edge("law_firms", "brief")
    g.add_edge("brief", "strategy")
    g.add_edge("strategy", "package")
    g.add_edge("package", END)
    return g.compile()


GRAPH = build_graph()


async def run_agentic(
    *,
    run_id: uuid.UUID,
    bill_id: uuid.UUID,
    company_id: uuid.UUID,
) -> uuid.UUID | None:
    """Top-level coroutine. Wraps Graph 2 execution in run-lifecycle bookkeeping
    + a final CONCLUDE event so the terminal panel can close the stream cleanly.
    """
    initial: AgenticState = {
        "run_id": run_id,
        "bill_id": bill_id,
        "company_id": company_id,
    }
    try:
        final = cast(AgenticState, await GRAPH.ainvoke(initial))
        if final.get("error"):
            await mark_failed(run_id, error=final["error"] or "unknown")
            await publish_event(
                run_id, EventType.ERROR,
                {"kind": "graph_failed", "text": final["error"]},
            )
            return None
        pkg_id = await persist_action_package(final)
        await mark_succeeded(run_id)
        await publish_event(
            run_id, EventType.CONCLUDE,
            {
                "kind": "graph_complete",
                "package_id": str(pkg_id) if pkg_id else None,
                "executive_summary": final.get("executive_summary"),
            },
        )
        return pkg_id
    except Exception as exc:
        log.exception("graph2_failed", run_id=str(run_id))
        await mark_failed(run_id, error=str(exc))
        await publish_event(
            run_id, EventType.ERROR,
            {"kind": "graph_failed", "text": str(exc)[:300]},
        )
        return None