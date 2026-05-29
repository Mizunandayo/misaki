from __future__ import annotations
from datetime import datetime
from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import text
from app.db.session import session_scope







router = APIRouter(prefix="/intelligence", tags=["intelligence"])

class Totals(BaseModel):
    calls: int
    est_cost_usd: float
    avg_latency_ms: int
    providers: int
    models: int





class CapabilityRow(BaseModel):
    capability: str
    calls: int
    avg_latency_ms: int
    est_cost_usd: float







class ModelRow(BaseModel):
    provider: str
    model: str
    calls: int
    avg_latency_ms: int
    est_cost_usd: float
    ok: int
    fallbacks: int
    errors: int





class TaskRow(BaseModel):
    task: str
    provider: str
    model: str
    calls: int
    avg_latency_ms: int








class RecentRow(BaseModel):
    task: str
    capability: str
    provider: str
    model: str
    status: str
    latency_ms: int
    cache_hit: bool
    occurred_at: datetime





class SummaryResponse(BaseModel):
    window_hours: int
    totals: Totals
    by_capability: list[CapabilityRow]
    by_model: list[ModelRow]
    by_task: list[TaskRow]
    recent: list[RecentRow]







@router.get("/summary", response_model=SummaryResponse)
async def summary(window_hours: int = Query(168, ge=1, le=2160)) -> SummaryResponse:
    """Window defaults to 7 days, capped at 90 (2160h) so the query can never
    be asked to scan an unbounded range. All aggregation is parameterized SQL.
    error_text is intentionally NOT exposed — only status counts — so no raw
    error strings ever leak to the client."""
    params = {"h": window_hours}
    async with session_scope() as session:
        totals_row = (
            await session.execute(
                text(
                    """
                    SELECT COUNT(*)                              AS calls,
                           COALESCE(SUM(est_cost_usd), 0)        AS est_cost_usd,
                           COALESCE(ROUND(AVG(latency_ms)), 0)::int AS avg_latency_ms,
                           COUNT(DISTINCT provider)              AS providers,
                           COUNT(DISTINCT model)                 AS models
                      FROM model_calls
                     WHERE occurred_at > NOW() - make_interval(hours => :h)
                    """
                ),
                params,
            )
        ).mappings().first()

        cap_rows = (
            await session.execute(
                text(
                    """
                    SELECT capability,
                           COUNT(*)                           AS calls,
                           ROUND(AVG(latency_ms))::int        AS avg_latency_ms,
                           ROUND(SUM(est_cost_usd)::numeric, 5) AS est_cost_usd
                      FROM model_calls
                     WHERE occurred_at > NOW() - make_interval(hours => :h)
                     GROUP BY capability
                     ORDER BY calls DESC
                    """
                ),
                params,
            )
        ).mappings().all()

        model_rows = (
            await session.execute(
                text(
                    """
                    SELECT provider, model,
                           COUNT(*)                            AS calls,
                           ROUND(AVG(latency_ms))::int         AS avg_latency_ms,
                           ROUND(SUM(est_cost_usd)::numeric, 5) AS est_cost_usd,
                           COUNT(*) FILTER (WHERE status = 'ok')       AS ok,
                           COUNT(*) FILTER (WHERE status = 'fallback') AS fallbacks,
                           COUNT(*) FILTER (WHERE status = 'error')    AS errors
                      FROM model_calls
                     WHERE occurred_at > NOW() - make_interval(hours => :h)
                     GROUP BY provider, model
                     ORDER BY calls DESC
                    """
                ),
                params,
            )
        ).mappings().all()

        # Per task, the dominant (most-used) provider/model — the routing proof.
        task_rows = (
            await session.execute(
                text(
                    """
                    SELECT task, provider, model, calls, avg_latency_ms
                      FROM (
                        SELECT task, provider, model,
                               COUNT(*)                     AS calls,
                               ROUND(AVG(latency_ms))::int  AS avg_latency_ms,
                               ROW_NUMBER() OVER (
                                 PARTITION BY task ORDER BY COUNT(*) DESC
                               ) AS rn
                          FROM model_calls
                         WHERE occurred_at > NOW() - make_interval(hours => :h)
                         GROUP BY task, provider, model
                      ) ranked
                     WHERE rn = 1
                     ORDER BY calls DESC
                    """
                ),
                params,
            )
        ).mappings().all()

        recent_rows = (
            await session.execute(
                text(
                    """
                    SELECT task, capability, provider, model, status,
                           latency_ms, cache_hit, occurred_at
                      FROM model_calls
                     WHERE occurred_at > NOW() - make_interval(hours => :h)
                     ORDER BY occurred_at DESC
                     LIMIT 12
                    """
                ),
                params,
            )
        ).mappings().all()

    return SummaryResponse(
        window_hours=window_hours,
        totals=Totals(
            calls=int(totals_row["calls"]),
            est_cost_usd=float(totals_row["est_cost_usd"]),
            avg_latency_ms=int(totals_row["avg_latency_ms"]),
            providers=int(totals_row["providers"]),
            models=int(totals_row["models"]),
        ),
        by_capability=[
            CapabilityRow(
                capability=r["capability"],
                calls=int(r["calls"]),
                avg_latency_ms=int(r["avg_latency_ms"]),
                est_cost_usd=float(r["est_cost_usd"]),
            )
            for r in cap_rows
        ],
        by_model=[
            ModelRow(
                provider=r["provider"],
                model=r["model"],
                calls=int(r["calls"]),
                avg_latency_ms=int(r["avg_latency_ms"]),
                est_cost_usd=float(r["est_cost_usd"]),
                ok=int(r["ok"]),
                fallbacks=int(r["fallbacks"]),
                errors=int(r["errors"]),
            )
            for r in model_rows
        ],
        by_task=[
            TaskRow(
                task=r["task"],
                provider=r["provider"],
                model=r["model"],
                calls=int(r["calls"]),
                avg_latency_ms=int(r["avg_latency_ms"]),
            )
            for r in task_rows
        ],
        recent=[
            RecentRow(
                task=r["task"],
                capability=r["capability"],
                provider=r["provider"],
                model=r["model"],
                status=r["status"],
                latency_ms=int(r["latency_ms"]),
                cache_hit=bool(r["cache_hit"]),
                occurred_at=r["occurred_at"],
            )
            for r in recent_rows
        ],
    )