from __future__ import annotations
from pydantic import BaseModel, Field


class AssessmentQuestion(BaseModel):
    id: str
    question: str
    category: str
    hint: str = ""


class GeneratedQuestions(BaseModel):
    questions: list[AssessmentQuestion] = Field(..., min_length=4, max_length=6)


class ReadinessAnswer(BaseModel):
    question_id: str
    question: str
    answer: str


class ReadinessScore(BaseModel):
    score: int = Field(..., ge=0, le=100)
    industry_average: int = Field(..., ge=0, le=100)
    grade: str  # "A" | "B" | "C" | "D" | "F"
    gaps_identified: list[str]
    cost_to_close: int
    recommendation: str
    is_above_average: bool
