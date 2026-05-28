"""SSE relay for MCP events.

GET /api/v1/events/stream?run_id=<uuid>

  1. Backfill — emit every persisted mcp_events row for the run, oldest
     first. This lets a late subscriber catch up cleanly.
  2. Tail — attach to the in-process bus and forward live NOTIFY payloads
     until the run concludes or the client disconnects.

Unauthenticated path (the demo terminal panel reads it from the browser
without the demo key — middleware exempts /events/stream).

GET /api/v1/events/run/{run_id}  →  run metadata (status, counters, timing)
"""

from __future__ import annotations

import asyncio
import json
import uuid

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import text

from app.db.session import session_scope
from app.mcp.bus import bus

router = APIRouter(prefix="/events", tags=["events"])


def _sse(payload: dict) -> bytes:
    return f"data: {json.dumps(payload, default=str)}\n\n".encode("utf-8")


@router.get("/stream")
async def stream_events(
    request: Request,
    run_id: uuid.UUID = Query(...),
):
    async def gen():
        # 1. Backfill any events already persisted for the run.
        async with session_scope() as session:
            rows = (
                await session.execute(
                    text(
                        """
                        SELECT event_type, payload, occurred_at
                          FROM mcp_events
                         WHERE run_id = :rid
                         ORDER BY id
                        """
                    ),
                    {"rid": run_id},
                )
            ).mappings().all()
        for row in rows:
            yield _sse(
                {
                    "type": row["event_type"],
                    "payload": row["payload"],
                    "occurred_at": row["occurred_at"],
                    "phase": "backfill",
                }
            )

        # 2. Tail the live bus until CONCLUDE / ERROR or the client drops.
        async for evt in bus.subscribe(run_id):
            if await request.is_disconnected():
                return
            yield _sse(evt)
            if evt.get("type") in {"CONCLUDE", "ERROR"}:
                # Give the queue one tick to flush trailing events, then close.
                await asyncio.sleep(0.05)
                return

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/run/{run_id}")
async def get_run(run_id: uuid.UUID) -> dict:
    async with session_scope() as session:
        r = (
            await session.execute(
                text(
                    """
                    SELECT id, kind, bill_id, company_id, status, current_step,
                           error_text, total_mcp_calls, total_credit_cents,
                           started_at, finished_at
                      FROM agent_runs
                     WHERE id = :rid
                    """
                ),
                {"rid": run_id},
            )
        ).mappings().first()
    if r is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Run not found")
    return dict(r)
