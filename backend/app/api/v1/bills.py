"""
Bills API.

GET /api/v1/bills           — paginated list
GET /api/v1/bills/{id}      — full detail with latest assessment
"""



from __future__ import annotations
import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import desc, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models import Bill


router = APIRouter(prefix="/bills", tags=["bills"])



class BillListItem(BaseModel):
    id: uuid.UUID
    jurisdiction: str
    bill_number: str
    title: str
    status: str
    pass_probability: int
    urgency_score: int


class BillListResponse(BaseModel):
    items: list[BillListItem]
    total: int


class BillDetail(BaseModel):
    id: uuid.UUID
    jurisdiction: str
    bill_number: str
    title: str
    full_text: str | None
    status: str
    introduced_at: Any | None
    effective_date: Any | None
    source_url: str | None
    pass_probability: int
    urgency_score: int
    assessment: dict | None





@router.get("", response_model=BillListResponse)
async def list_bills(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    jurisdiction: str | None = Query(None, max_length=8),
) -> BillListResponse:
    base = select(Bill).order_by(desc(Bill.urgency_score), desc(Bill.created_at))
    if jurisdiction:
        base = base.where(Bill.jurisdiction == jurisdiction)

    rows = (await db.execute(base.limit(limit).offset(offset))).scalars().all()
    total_query = select(text("COUNT(*)")).select_from(Bill)
    if jurisdiction:
        total_query = total_query.where(Bill.jurisdiction == jurisdiction)
    total = (await db.execute(total_query)).scalar_one()

    return BillListResponse(
        items=[
            BillListItem(
                id=r.id,
                jurisdiction=r.jurisdiction,
                bill_number=r.bill_number,
                title=r.title,
                status=r.status,
                pass_probability=r.pass_probability,
                urgency_score=r.urgency_score,
            )
            for r in rows
        ],
        total=int(total),
    )








@router.get("/{bill_id}", response_model=BillDetail)
async def get_bill(
    bill_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> BillDetail:
    bill = (
        await db.execute(select(Bill).where(Bill.id == bill_id))
    ).scalar_one_or_none()
    if bill is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bill not found")

    assessment_row = (
        await db.execute(
            text(
                """
                SELECT verdict, confidence, reasoning_chain,
                       triggering_clause_text, triggering_clause_location,
                       compliance_cost_estimate, affected_operations,
                       comparable_bills
                FROM assessments
                WHERE bill_id = :bid
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"bid": bill_id},
        )
    ).mappings().first()

    return BillDetail(
        id=bill.id,
        jurisdiction=bill.jurisdiction,
        bill_number=bill.bill_number,
        title=bill.title,
        full_text=bill.full_text,
        status=bill.status,
        introduced_at=bill.introduced_at,
        effective_date=bill.effective_date,
        source_url=bill.source_url,
        pass_probability=bill.pass_probability,
        urgency_score=bill.urgency_score,
        assessment=dict(assessment_row) if assessment_row else None,
    )