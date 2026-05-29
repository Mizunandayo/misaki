from __future__ import annotations
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from app.core.signing import verify
from app.db.session import session_scope

router = APIRouter(prefix="/share", tags=["share"])










@router.get("/scanner/{token}")
async def share_scanner(token: str) -> dict:
    verified = verify(token, expected_kind="scanner")
    if verified is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Invalid or expired share token")
    report_id_str, token_exp_unix = verified
    try:
        report_id = uuid.UUID(report_id_str)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Malformed token payload")

    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    SELECT id, company_name_display, exposure_score,
                           total_exposure_low_usd, total_exposure_high_usd,
                           top_threats, strategic_summary, raw_sec_excerpt,
                           created_at, expires_at
                      FROM scanner_reports
                     WHERE id = :rid AND expires_at > NOW()
                    """
                ),
                {"rid": report_id},
            )
        ).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found or expired")
    payload = dict(row)
    # Token expiry is distinct from the underlying scanner_reports cache TTL
    # (24h share-link vs 7-day report cache). Surface BOTH so the share page
    # can render "Link expires…" using the link's actual TTL, not the report's.
    payload["token_expires_at"] = datetime.fromtimestamp(
        token_exp_unix, tz=timezone.utc
    ).isoformat()
    return payload