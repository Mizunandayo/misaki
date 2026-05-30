"""Public Company Scanner — unauthenticated landing page surface.
POST /api/v1/scanner            { name }            → { run_id, cached?, report_id? }
GET  /api/v1/scanner/{report_id}                    → ScannerReport row
POST /api/v1/scanner/{report_id}/share              → { token, url, expires_at }
"""




from __future__ import annotations
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import text
from app.ai.guards import sanitize_company_name
from app.core.signing import mint as mint_token, DEFAULT_TTL_SECONDS
from app.db.session import session_scope
from app.graphs.scanner import run_scanner
from app.services.agent_run import create_run

router = APIRouter(prefix="/scanner", tags=["scanner"])
limiter = Limiter(key_func=get_remote_address)







class ScannerRunRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)


class ScannerRunResponse(BaseModel):
    run_id: uuid.UUID
    cached: bool
    report_id: uuid.UUID | None = None


def _normalize(name: str) -> str:
    return " ".join(name.lower().split())




@router.post("", response_model=ScannerRunResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute")
@limiter.limit("40/day")
async def start_scan(request: Request, payload: ScannerRunRequest):
    clean = sanitize_company_name(payload.name)
    if clean is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Company name must be 2–80 chars, ASCII letters/digits/.&- only",
        )
    normalized = _normalize(clean)

    async with session_scope() as session:
        cached_row = (
            await session.execute(
                text(
                    """
                    SELECT id, run_id, expires_at
                      FROM scanner_reports
                     WHERE company_name_normalized = :n
                       AND expires_at > NOW()
                     LIMIT 1
                    """
                ),
                {"n": normalized},
            )
        ).mappings().first()

    if cached_row is not None:
        return ScannerRunResponse(
            run_id=cached_row["run_id"] or uuid.uuid4(),
            cached=True,
            report_id=cached_row["id"],
        )

    run_id = await create_run(kind="SCANNER", scanner_input=clean)
    asyncio.create_task(
        run_scanner(
            run_id=run_id,
            company_name=clean,
            company_name_normalized=normalized,
        )
    )
    return ScannerRunResponse(run_id=run_id, cached=False)


@router.get("/{report_id}")
async def get_report(report_id: uuid.UUID) -> dict:
    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    SELECT id, company_name_display, company_name_normalized,
                           exposure_score, total_exposure_low_usd,
                           total_exposure_high_usd, top_threats,
                           strategic_summary, raw_sec_excerpt,
                           run_id, expires_at, created_at
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


class ShareLinkResponse(BaseModel):
    token: str
    path: str
    expires_at: datetime


@router.post("/{report_id}/share", response_model=ShareLinkResponse)
async def mint_share_link(report_id: uuid.UUID):
    async with session_scope() as session:
        row = (
            await session.execute(
                text("SELECT id FROM scanner_reports WHERE id = :rid AND expires_at > NOW()"),
                {"rid": report_id},
            )
        ).first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found or expired")

    token = mint_token("scanner", str(report_id), ttl_seconds=DEFAULT_TTL_SECONDS)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=DEFAULT_TTL_SECONDS)
    return ShareLinkResponse(
        token=token,
        path=f"/api/v1/share/scanner/{token}",
        expires_at=expires_at,
    )