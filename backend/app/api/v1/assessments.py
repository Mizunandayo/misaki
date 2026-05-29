"""
Assessments API.

POST /api/v1/assessments/{bill_id}/run           — kick off Graph 1
GET  /api/v1/assessments/{bill_id}/stream        — SSE stream of analysis
GET  /api/v1/assessments/{bill_id}               — latest assessment JSON
"""


from __future__ import annotations
import asyncio
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.db.session import get_db
from app.graphs.bill_analysis import run_analysis



router = APIRouter(prefix="/assessments", tags=["assessments"])
limiter = Limiter(key_func=get_remote_address)






@router.post("/{bill_id}/run")
@limiter.limit("10/minute")
async def run_assessment(
    request: Request,
    bill_id: uuid.UUID,
) -> dict[str, str]:
    """Synchronous trigger. Returns once analysis completes."""
    final = await run_analysis(bill_id)
    if final.get("error"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, final["error"])
    verdict = final.get("verdict")
    return {
        "status": "ok",
        "verdict": verdict.verdict if verdict else "skipped",
    }


@router.get("/{bill_id}/stream")
@limiter.limit("10/minute")
async def stream_assessment(
    request: Request,
    bill_id: uuid.UUID,
):
    """
    Server-Sent Events stream. Frontend's EventSource consumes this.
    Emits status updates as the graph progresses, then the final
    verdict + reasoning chain as a JSON payload.
    """

    async def event_stream():
        try:
            yield _sse({"type": "started", "bill_id": str(bill_id)})

            yield _sse({"type": "node", "name": "ingest"})
            await asyncio.sleep(0.01)

            final = await run_analysis(bill_id)

            if final.get("error"):
                yield _sse({"type": "error", "message": final["error"]})
                return

            triage = final.get("triage")
            if triage is not None:
                yield _sse({
                    "type": "triage",
                    "passed": triage.passes,
                    "confidence": triage.confidence,
                    "reason": triage.reason,
                })

            verdict = final.get("verdict")
            if verdict is None:
                yield _sse({"type": "skipped", "reason": triage.reason if triage else "no triage"})
                return

            # --- model attribution ------------------------------------------
            # Query the most recent successful 'applicability' call from
            # model_calls. run_analysis() is synchronous here so the row is
            # already committed by the time we query. The 30-second window
            # is wide enough to survive slow analyses; narrow enough to never
            # return a stale row from a prior request.
            # SECURITY: only task='applicability' is queried; no user-supplied
            # input enters the SQL (bill_id is validated as uuid by FastAPI).
            async with session_scope() as db_session:
                attr_row = (
                    await db_session.execute(
                        text(
                            """
                            SELECT provider, model, capability, latency_ms
                              FROM model_calls
                             WHERE task = 'applicability'
                               AND status = 'ok'
                               AND occurred_at > NOW() - INTERVAL '30 seconds'
                             ORDER BY occurred_at DESC
                             LIMIT 1
                            """
                        )
                    )
                ).mappings().first()

            if attr_row:
                yield _sse({
                    "type": "model_attribution",
                    "task": "applicability",
                    "provider": attr_row["provider"],
                    "model": attr_row["model"],
                    "capability": attr_row["capability"],
                    "latency_ms": attr_row["latency_ms"],
                })
            # ----------------------------------------------------------------

            probability = final.get("probability")

            for step in verdict.reasoning_chain:
                yield _sse({
                    "type": "reasoning_step",
                    "step": step.step,
                    "observation": step.observation,
                    "inference": step.inference,
                })
                await asyncio.sleep(0.08)

            yield _sse({
                "type": "verdict",
                "verdict": verdict.verdict,
                "confidence": verdict.confidence,
                "triggering_clause_text": verdict.triggering_clause_text,
                "triggering_clause_location": verdict.triggering_clause_location,
                "compliance_cost_estimate_usd": verdict.compliance_cost_estimate_usd,
                "affected_operations": [o.model_dump() for o in verdict.affected_operations],
                "legal_precedent": verdict.legal_precedent,
                "precedents": final.get("precedents", []),
                "probability": probability.model_dump() if probability else None,
            })

            yield _sse({"type": "done"})
        except asyncio.CancelledError:
            return
        except Exception as exc:
            yield _sse({"type": "error", "message": str(exc)[:300]})

    

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/{bill_id}")
async def get_assessment(
    bill_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> dict:
    row = (
        await db.execute(
            text(
                """
                SELECT verdict, confidence, reasoning_chain,
                       triggering_clause_text, triggering_clause_location,
                       compliance_cost_estimate, affected_operations,
                       comparable_bills, created_at
                FROM assessments
                WHERE bill_id = :bid
                ORDER BY created_at DESC LIMIT 1
                """
            ),
            {"bid": bill_id},
        )
    ).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No assessment yet")
    return dict(row)


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload, default=str)}\n\n"