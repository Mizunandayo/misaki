from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


class DiffChange(BaseModel):
    type: Literal["add", "remove", "modify"]
    text: str = Field(max_length=1200)
    location: str = Field(default="", max_length=200)
    compliance_impact: Literal["increases", "decreases", "neutral"]
    impact_rationale: str = Field(max_length=600)


class AmendmentDiffResult(BaseModel):
    changes: list[DiffChange] = Field(min_length=0, max_length=24)
    exposure_delta_usd: int = Field(
        description="Estimated change in compliance exposure attributable to this amendment. Negative = cheaper."
    )
    summary: str = Field(min_length=20, max_length=600)


class MomentumSnapshot(BaseModel):
    jurisdiction: str = Field(max_length=64)
    score: float = Field(ge=0.0, le=10.0)
    bill_count_session: int = Field(ge=0)
    enforcement_count_30d: int = Field(ge=0)
    political_event_label: str | None = Field(default=None, max_length=200)
    rationale: str = Field(max_length=400)
