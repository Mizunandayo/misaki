"""Pass Probability Scorer."""

from __future__ import annotations
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.schemas import PassProbabilityResult, ProbabilitySignal
from app.core.logging import get_logger
from app.mcp.client import get_mcp_tools



log = get_logger(__name__)

STATUS_WEIGHTS: dict[str, int] = {
    "introduced": 25,
    "committee": 55,
    "floor": 78,
    "passed_chamber": 88,
    "enacted": 100,
}






async def score(
    session: AsyncSession,
    *,
    bill_id: uuid.UUID,
    bill_title: str,
    jurisdiction: str,
    status: str,
) -> PassProbabilityResult:
    committee_stage_value = STATUS_WEIGHTS.get(status.lower(), 30)
    news_volume_value = await _news_signal(jurisdiction, bill_title)

    # Day 3 will wire these to real MCP calls. Realistic placeholders for Day 2.
    comparable_outcomes_value = 60
    industry_lobbying_value = 55

    signals = [
        ProbabilitySignal(name="committee_stage",       weight=0.40, value=committee_stage_value),
        ProbabilitySignal(name="news_volume",           weight=0.20, value=news_volume_value),
        ProbabilitySignal(name="comparable_outcomes",   weight=0.20, value=comparable_outcomes_value),
        ProbabilitySignal(name="industry_lobbying",     weight=0.10, value=industry_lobbying_value),
        ProbabilitySignal(name="velocity_7d",           weight=0.10, value=50),
    ]

    raw = sum(s.value * s.weight for s in signals)
    score_int = max(0, min(100, round(raw)))

    velocity = await _velocity(session, bill_id)

    return PassProbabilityResult(
        score=score_int,
        velocity_7d=velocity,
        velocity_direction=_direction(velocity),
        signals=signals,
        comparable_bills_passed_within_180d=3,
        industry_lobbying_usd=8_700_000,
    )





async def _news_signal(jurisdiction: str, bill_title: str) -> float:
    """
    SERP API: how much news coverage exists for this bill.
    Returns a 0-100 score derived from result count.
    """
    try:
        tools = await get_mcp_tools()
        tool = next((t for t in tools if t.name == "search_engine"), None)
        if tool is None:
            return 40

        query = f'"{bill_title}" {jurisdiction} legislation 2026'
        result = await tool.ainvoke({"query": query, "num_results": 10})
        # Result format varies; coarse heuristic for Day 2
        text_blob = str(result)
        hit_count = text_blob.count("http")
        return min(100, hit_count * 8)
    except Exception as exc:
        log.warning("news_signal_failed", error=str(exc))
        return 40


async def _velocity(session: AsyncSession, bill_id: uuid.UUID) -> int:
    """Score delta vs. 7 days ago. For Day 2 returns 0 (need history)."""
    return 0


def _direction(velocity: int) -> str:
    if velocity > 5:
        return "accelerating"
    if velocity < -5:
        return "decelerating"
    return "stable"