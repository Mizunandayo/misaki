from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models import CompanyProfile

router = APIRouter(prefix="/profile", tags=["profile"])

DEMO_PROFILE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")




class ProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    industry_tags: list[str]
    jurisdictions: list[str]
    headcount: int | None
    revenue_band: str | None
    data_handling_classification: str | None
    compliance_certifications: list[str]
    profile_confidence_score: int




@router.get("/demo", response_model=ProfileResponse)
async def get_demo_profile(db: AsyncSession = Depends(get_db)) -> ProfileResponse:
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.id == DEMO_PROFILE_ID)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Demo profile not seeded")

    return ProfileResponse.model_validate(profile, from_attributes=True)