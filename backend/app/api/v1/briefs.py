"""
Briefs API.
POST /api/v1/briefs/{bill_id}/generate  — stream PDF generation progress (SSE via fetch POST)
GET  /api/v1/briefs/{bill_id}/latest    — latest brief metadata for a bill
"""
from __future__ import annotations
import json
import uuid
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import text
from app.db.session import session_scope
from app.services.brief_generator import generate_brief






router = APIRouter(prefix="/briefs", tags=["briefs"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/{bill_id}/generate")
@limiter.limit("3/minute")
async def stream_brief_generation(
    request: Request,
    bill_id: uuid.UUID,
):
    """
    SSE stream for PDF generation progress. Frontend uses fetch POST
    (not EventSource, which is GET-only) to read this stream.
    Rate: 3 requests/min per IP — brief generation is expensive.
    """

    async def _stream():
        try:
            async for event in generate_brief(bill_id):
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'step': 'error', 'message': str(exc)[:300]})}\n\n"

    return StreamingResponse(
        _stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/{bill_id}/latest")
async def get_latest_brief(bill_id: uuid.UUID) -> dict:
    """Returns the most recent brief for a bill or 404."""
    async with session_scope() as db:
        row = (
            await db.execute(
                text(
                    """
                    SELECT id, storage_path, signed_url, signed_url_expires_at,
                           compliance_exposure_usd, total_gaps, verdict, pages, created_at
                    FROM briefs
                    WHERE bill_id = :bid
                    ORDER BY created_at DESC
                    LIMIT 1
                    """
                ),
                {"bid": bill_id},
            )
        ).mappings().first()

    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No brief generated yet")

    return dict(row)
