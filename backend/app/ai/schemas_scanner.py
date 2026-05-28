from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field, HttpUrl









class ScannerThreat(BaseModel):
    jurisdiction: str = Field(max_length=64)
    bill_or_program: str = Field(max_length=200)
    title: str = Field(max_length=300)
    urgency_label: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    one_line_reason: str = Field(max_length=400)
    source_url: HttpUrl | None = None










class ScannerJurisdictionMomentum(BaseModel):
    jurisdiction: str = Field(max_length=64)
    momentum_score: float = Field(ge=0.0, le=10.0)
    rationale: str = Field(max_length=300)









class ScannerReport(BaseModel):
    company_name: str = Field(min_length=1, max_length=120)
    company_name_normalized: str = Field(min_length=1, max_length=120)
    exposure_score: int = Field(ge=0, le=100)
    total_exposure_low_usd: int = Field(ge=0)
    total_exposure_high_usd: int = Field(ge=0)
    top_threats: list[ScannerThreat] = Field(min_length=0, max_length=5)
    jurisdiction_momentum: list[ScannerJurisdictionMomentum] = Field(
        min_length=0, max_length=10
    )
    strategic_summary: str = Field(min_length=80, max_length=900)
    raw_sec_excerpt: str = Field(
        default="",
        max_length=4000,
        description="Verbatim Risk Factors text scraped from EDGAR — UI displays alongside the processed report as proof-of-source.",
    )