from __future__ import annotations
import uuid
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from app.core.signing import verify
from app.db.session import session_scope

router = APIRouter(prefix="/share", tags=["share"])










@router.get("/scanner/{token}")
async def share_scanner(token: str) -> dict:
    report_id_str = verify(token, expected_kind="scanner")
    if report_id_str is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Invalid or expired share token")
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
    return dict(row)