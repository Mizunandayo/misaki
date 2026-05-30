from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field









class ComplianceGap(BaseModel):
    title: str = Field(..., description="Short title of the compliance gap")
    description: str = Field(..., description="What must change and why, in one sentence")
    engineering_effort: Literal["Low", "Medium", "High", "Critical"]
    estimated_weeks: int = Field(..., ge=1, le=52)
    estimated_cost_usd: int = Field(..., ge=0)
    owner: Literal["Legal", "Engineering", "Security", "Operations", "Management"]






class ActionItem(BaseModel):
    priority: int = Field(..., ge=1, le=10, description="1 = highest priority")
    action: str = Field(..., description="Specific, actionable task")
    owner: Literal["Legal", "Engineering", "Security", "Operations", "Management"]
    deadline_days: int = Field(..., ge=1, description="Days from today to complete")
    cost_usd: int | None = None






class BriefContent(BaseModel):
    executive_summary: str = Field(
        ...,
        description=(
            "Exactly 3 sentences. Sentence 1: what the bill does. "
            "Sentence 2: why it applies to this company specifically. "
            "Sentence 3: what action is required and by when."
        ),
    )
    key_obligations: list[str] = Field(
        ...,
        min_length=2,
        max_length=7,
        description="Specific compliance obligations the bill creates",
    )
    current_posture_before: str = Field(
        ...,
        description="Current state of the company's relevant compliance posture (2-3 sentences)",
    )
    required_posture_after: str = Field(
        ...,
        description="What the bill requires the company to achieve (2-3 sentences)",
    )
    compliance_gaps: list[ComplianceGap] = Field(..., min_length=1, max_length=8)
    action_items: list[ActionItem] = Field(..., min_length=2, max_length=10)
    total_compliance_cost_usd: int = Field(
        ...,
        ge=0,
        description=(
            "Sum of all gap estimated_cost_usd values. "
            "Must equal sum of compliance_gaps[*].estimated_cost_usd."
        ),
    )
    compliance_window_days: int | None = Field(
        None,
        description="Days from bill passage to compliance deadline, if known",
    )
    recommended_escalation: str = Field(
        ...,
        description="1-2 sentences on who should be notified and by when",
    )
    pass_probability_note: str = Field(
        ...,
        description="One sentence on the bill's estimated likelihood of passage",
    )
