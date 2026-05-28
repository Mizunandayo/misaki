"""agent_runs lifecycle helpers."""

from __future__ import annotations
import uuid
from typing import Literal
from sqlalchemy import text
from app.db.session import session_scope

RunKind = Literal["AGENTIC", "SCANNER"]








async def create_run(
    *,
    kind: RunKind,
    bill_id: uuid.UUID | None = None,
    company_id: uuid.UUID | None = None,
    scanner_input: str | None = None,
) -> uuid.UUID:
    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    INSERT INTO agent_runs (kind, bill_id, company_id, scanner_input, status)
                    VALUES (:kind, :bill_id, :company_id, :scanner_input, 'queued')
                    RETURNING id
                    """
                ),
                {
                    "kind": kind,
                    "bill_id": bill_id,
                    "company_id": company_id,
                    "scanner_input": scanner_input,
                },
            )
        ).scalar_one()
    return row



async def mark_step(run_id: uuid.UUID, *, step: str) -> None:
    async with session_scope() as session:
        await session.execute(
            text(
                "UPDATE agent_runs "
                "SET current_step = :s, status = 'running' "
                "WHERE id = :rid"
            ),
            {"s": step, "rid": run_id},
        )



async def mark_succeeded(run_id: uuid.UUID) -> None:
    async with session_scope() as session:
        await session.execute(
            text(
                "UPDATE agent_runs "
                "SET status = 'succeeded', current_step = 'done', finished_at = NOW() "
                "WHERE id = :rid"
            ),
            {"rid": run_id},
        )



async def mark_failed(run_id: uuid.UUID, *, error: str) -> None:
    async with session_scope() as session:
        await session.execute(
            text(
                "UPDATE agent_runs "
                "SET status = 'failed', error_text = :err, finished_at = NOW() "
                "WHERE id = :rid"
            ),
            {"rid": run_id, "err": error[:500]},
        )
