"""
Company Intelligence Profile endpoints.
GET  /api/v1/profile/demo              — read NovaTech seed
POST /api/v1/profile/build             — auto-dossier from company name
PUT  /api/v1/profile/demo              — edit + re-trigger analysis
"""



from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.ai.schemas import AutoDossierResult
from app.db.session import get_db
from app.models import CompanyProfile
from app.services.profile_builder import build_dossier



router = APIRouter(prefix="/profile", tags=["profile"])
limiter = Limiter(key_func=get_remote_address)

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
    tech_stack_indicators: list[str]
    profile_confidence_score: int
    profile_gaps: list[dict]


class BuildRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80, pattern=r"^[A-Za-z0-9 .,'&\-]+$")


class ProfileUpdate(BaseModel):
    industry_tags: list[str] | None = Field(default=None, max_length=20)
    jurisdictions: list[str] | None = Field(default=None, max_length=60)
    headcount: int | None = Field(default=None, ge=1, le=10_000_000)
    revenue_band: str | None = Field(default=None, max_length=64)
    data_handling_classification: str | None = Field(default=None, max_length=64)
    compliance_certifications: list[str] | None = Field(default=None, max_length=20)


@router.get("/demo", response_model=ProfileResponse)
async def get_demo_profile(db: AsyncSession = Depends(get_db)) -> ProfileResponse:
    profile = (
        await db.execute(select(CompanyProfile).where(CompanyProfile.id == DEMO_PROFILE_ID))
    ).scalar_one_or_none()
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Demo profile not seeded")
    return ProfileResponse.model_validate(profile, from_attributes=True)


@router.post("/build", response_model=AutoDossierResult)
@limiter.limit("5/minute")
async def build_profile(request: Request, body: BuildRequest) -> AutoDossierResult:
    """Auto-build a Company Intelligence Profile from a company name."""
    try:
        return await build_dossier(body.name)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))


@router.put("/demo", response_model=ProfileResponse)
async def update_demo_profile(
    body: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    fields = body.model_dump(exclude_unset=True)
    if not fields:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update")

    set_clauses = ", ".join(f"{k} = :{k}" for k in fields.keys())
    params = {**fields, "id": DEMO_PROFILE_ID}
    await db.execute(
        text(f"UPDATE company_profiles SET {set_clauses} WHERE id = :id"),
        params,
    )

    profile = (
        await db.execute(select(CompanyProfile).where(CompanyProfile.id == DEMO_PROFILE_ID))
    ).scalar_one_or_none()
    return ProfileResponse.model_validate(profile, from_attributes=True)
