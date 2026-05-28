"""Graph 2 (Agentic Response) public surface."""




from __future__ import annotations
import asyncio
import uuid
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from app.db.session import session_scope
from app.graphs.agentic_response import run_agentic
from app.services.agent_run import create_run




router = APIRouter(prefix="/agentic", tags=["agentic"])
DEMO_COMPANY_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")









class AgenticRunRequest(BaseModel):
    bill_id: uuid.UUID
    company_id: uuid.UUID | None = Field(
        default=None,
        description="Defaults to the seeded NovaTech profile for the demo path.",
    )




class AgenticRunResponse(BaseModel):
    run_id: uuid.UUID





@router.post(
    "/run",
    response_model=AgenticRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def trigger_agentic_run(payload: AgenticRunRequest, request: Request):
    """Tight slowapi limit — agentic runs spend Bright Data credits."""
    company_id = payload.company_id or DEMO_COMPANY_ID

    async with session_scope() as session:
        bill_exists = (
            await session.execute(
                text("SELECT 1 FROM bills WHERE id = :bid"),
                {"bid": payload.bill_id},
            )
        ).first()
    if bill_exists is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Bill not found")

    run_id = await create_run(
        kind="AGENTIC",
        bill_id=payload.bill_id,
        company_id=company_id,
    )

    # Fire-and-forget background task. Errors land in agent_runs.error_text +
    # the SSE stream's ERROR event.
    asyncio.create_task(
        run_agentic(
            run_id=run_id,
            bill_id=payload.bill_id,
            company_id=company_id,
        )
    )
    return AgenticRunResponse(run_id=run_id)







@router.get("/runs/{run_id}/package")
async def get_package_by_run(run_id: uuid.UUID) -> dict:
    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    SELECT id, bill_id, company_id, run_id, payload, created_at
                      FROM action_packages
                     WHERE run_id = :rid
                     ORDER BY created_at DESC
                     LIMIT 1
                    """
                ),
                {"rid": run_id},
            )
        ).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No package for run")
    return dict(row)









@router.get("/bills/{bill_id}/package")
async def get_latest_package(bill_id: uuid.UUID) -> dict:
    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    SELECT id, bill_id, company_id, run_id, payload, created_at
                      FROM action_packages
                     WHERE bill_id = :bid
                     ORDER BY created_at DESC
                     LIMIT 1
                    """
                ),
                {"bid": bill_id},
            )
        ).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No package yet")
    return dict(row)