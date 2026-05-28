from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field, HttpUrl, field_validator




# Step 1 Law Firm Discovery

class LawFirm(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    headline: str = Field(
        max_length=280,
        description="One-line positioning — pulled verbatim from the firm site.",
    )
    jurisdiction: str = Field(max_length=64)
    practice_areas: list[str] = Field(default_factory=list, max_length=8)
    relevant_case_history: str = Field(
        default="",
        max_length=600,
        description="Past cases / advisory work relevant to this bill.",
    )
    website: HttpUrl
    relevance_score: int = Field(
        ge=0, le=100,
        description="0-100 fit score against the bill's domain + jurisdiction.",
    )

    @field_validator("practice_areas")
    @classmethod
    def cap_practice_area_len(cls, v: list[str]) -> list[str]:
        return [s[:60] for s in v if s and s.strip()][:8]


class LawFirmBundle(BaseModel):
    query: str = Field(max_length=240)
    firms: list[LawFirm] = Field(min_length=0, max_length=5)
    sources_scanned: int = Field(ge=0, le=200)






# Step 2 Lobbyist Response Brief

class BriefSection(BaseModel):
    heading: str = Field(max_length=120)
    body_markdown: str = Field(max_length=2400)




class LobbyistBriefDraft(BaseModel):
    addressed_to: str = Field(max_length=160)
    subject_line: str = Field(max_length=200)
    one_line_position: str = Field(max_length=280)
    sections: list[BriefSection] = Field(min_length=3, max_length=6)
    recommended_amendment: str = Field(
        max_length=1600,
        description=(
            "Specific legislative language the company would prefer — drafted "
            "as a paragraph that could be inserted into the bill."
        ),
    )
    rationale_summary: str = Field(max_length=600)






 # Step 3 Competitive Response Strategy

class CompetitorMove(BaseModel):
    competitor: str = Field(max_length=120)
    action: str = Field(max_length=400)
    timing_relative_days: int = Field(
        ge=-3650, le=3650,
        description="Days before (negative) or after (positive) bill advancement.",
    )
    public_url: HttpUrl | None = None
    



class CompetitiveResponseStrategy(BaseModel):
    precedent_bill: str = Field(max_length=200)
    competitor_moves: list[CompetitorMove] = Field(max_length=6)
    recommended_play: Literal[
        "PROACTIVE_PUBLIC_SUPPORT",
        "PROACTIVE_QUIET_INVESTMENT",
        "REACTIVE_WAIT_AND_SEE",
        "OPPOSE_AND_AMEND",
    ]
    recommendation_summary: str = Field(max_length=1200)
    confidence: int = Field(ge=0, le=100)








# Step 4 Final Action Package


class ActionPackage(BaseModel):
    bill_id: str
    company_id: str
    law_firms: LawFirmBundle
    lobbyist_brief: LobbyistBriefDraft
    competitive_strategy: CompetitiveResponseStrategy
    executive_summary: str = Field(max_length=900)
