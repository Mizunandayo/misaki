from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field, field_validator

Verdict = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "NOT_APPLICABLE"]





class TriageResult(BaseModel):
    """Output of Gemini 2.5 Flash triage — cheap PASS/SKIP gate."""

    passes: bool = Field(
        description=(
            "True if this bill warrants deep applicability analysis. "
            "Apply conservatively — when in doubt, return True."
        )
    )
    reason: str = Field(
        description="One-sentence justification for the PASS/SKIP decision.",
        max_length=400,
    )
    confidence: int = Field(ge=0, le=100)


class ReasoningStep(BaseModel):
    """One step in the Gemini Pro chain of reasoning."""

    step: int = Field(ge=1)
    observation: str = Field(max_length=600)
    inference: str = Field(max_length=600)


class AffectedOperation(BaseModel):
    """One area of the company's operations affected by the bill."""

    area: str = Field(max_length=120)
    impact: str = Field(max_length=600)
    severity: Literal["high", "medium", "low"]





class ApplicabilityVerdict(BaseModel):
    """Output of Gemini 2.5 Pro deep reasoning."""


    verdict: Verdict
    confidence: int = Field(ge=0, le=100)
    reasoning_chain: list[ReasoningStep] = Field(min_length=2, max_length=8)
    triggering_clause_text: str = Field(
        max_length=2000,
        description="The exact bill text that triggered this verdict.",
    )
    triggering_clause_location: str = Field(
        max_length=200,
        description="Section / paragraph reference within the bill.",
    )
    compliance_cost_estimate_usd: int = Field(
        ge=0,
        description="Estimated total compliance cost in USD.",
    )
    affected_operations: list[AffectedOperation] = Field(min_length=1, max_length=8)
    legal_precedent: str = Field(
        max_length=400,
        description=(
            "One-sentence comparison to a comparable historical law and "
            "the percentage of similar companies it affected."
        ),
    )

    @field_validator("triggering_clause_text")
    @classmethod
    def clause_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("triggering_clause_text cannot be empty")
        return v


class ProbabilitySignal(BaseModel):
    name: str
    weight: float = Field(ge=0, le=1)
    value: float = Field(ge=0, le=100)


class PassProbabilityResult(BaseModel):
    score: int = Field(ge=0, le=100)
    velocity_7d: int = Field(description="Change in score over last 7 days")
    velocity_direction: Literal["accelerating", "decelerating", "stable"]
    signals: list[ProbabilitySignal]
    comparable_bills_passed_within_180d: int = Field(ge=0)
    industry_lobbying_usd: int = Field(ge=0)





class ProfileGap(BaseModel):
    field: str
    reason: str
    accuracy_impact_pct: int = Field(ge=0, le=100)


class AutoDossierResult(BaseModel):
    name: str
    industry_tags: list[str]
    jurisdictions: list[str]
    headcount: int | None = None
    revenue_band: str | None = None
    data_handling_classification: str | None = None
    compliance_certifications: list[str] = Field(default_factory=list)
    tech_stack_indicators: list[str] = Field(default_factory=list)
    profile_confidence_score: int = Field(ge=0, le=100)
    profile_gaps: list[ProfileGap] = Field(default_factory=list)
    sources: dict[str, str] = Field(
        default_factory=dict,
        description="field_name → source URL or description",
    )


