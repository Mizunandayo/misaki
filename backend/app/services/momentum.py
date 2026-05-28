"""Regulatory momentum scoring per jurisdiction."""

from __future__ import annotations
import uuid
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason
from app.ai.prompts_services import MOMENTUM_SYSTEM, MOMENTUM_USER
from app.ai.schemas_services import MomentumSnapshot
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.toolbox import call_tool
log = get_logger(__name__)













async def _enforcement_count(run_id: uuid.UUID, jurisdiction: str) -> int:
    serp = await call_tool(
        run_id=run_id,
        tool_name="search_engine",
        args={
            "query": f"{jurisdiction} regulatory enforcement action 2026 past 30 days",
            "engine": "google",
        },
        summarize=f"Enforcement actions — {jurisdiction}",
    )
    raw = (serp.get("organic_results") if isinstance(serp, dict) else serp) or []
    return min(40, len(raw))


async def snapshot(
    *,
    run_id: uuid.UUID,
    jurisdiction: str,
) -> MomentumSnapshot:
    async with session_scope() as session:
        stats = (
            await session.execute(
                text(
                    """
                    SELECT
                      COUNT(*)                                                  AS bill_count,
                      COALESCE(SUM(CASE WHEN status='enacted' THEN 1 END), 0)    AS enacted,
                      COALESCE(SUM(amount_usd), 0)                               AS lobby_total
                      FROM bills b
                      LEFT JOIN lobbyist_filings lf
                        ON lf.bill_id = b.id
                        AND lf.created_at > NOW() - INTERVAL '90 days'
                     WHERE b.jurisdiction = :j
                    """
                ),
                {"j": jurisdiction},
            )
        ).mappings().first() or {"bill_count": 0, "enacted": 0, "lobby_total": 0}

    enforcement = await _enforcement_count(run_id, jurisdiction)

    snap = await reason(
        task="momentum_snapshot",
        capability=Capability.FAST_CHEAP,
        schema=MomentumSnapshot,
        system_prompt=MOMENTUM_SYSTEM,
        user_prompt=MOMENTUM_USER.format(
            jurisdiction=jurisdiction,
            bill_count_session=stats["bill_count"],
            enacted_delta_pct=0,  # Day 4 wires prior-session comparison
            enforcement_count_30d=enforcement,
            lobbying_spend_usd=stats["lobby_total"],
            session_days_remaining=90,
        ),
        run_id=run_id,
    )

    async with session_scope() as session:
        await session.execute(
            text(
                """
                INSERT INTO momentum_history
                   (jurisdiction, score, bill_count_session,
                    enforcement_count_30d, political_event_label)
                VALUES (:j, :s, :bcs, :ec, :pe)
                """
            ),
            {
                "j": snap.jurisdiction,
                "s": snap.score,
                "bcs": snap.bill_count_session,
                "ec": snap.enforcement_count_30d,
                "pe": snap.political_event_label,
            },
        )
    return snap
