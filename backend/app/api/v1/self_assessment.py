from __future__ import annotations
import uuid
import json
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import text
from app.ai.capabilities import Capability
from app.ai.gateway import reason
from app.ai.prompts_self_assessment import (
    QUESTIONS_SYSTEM, SCORE_SYSTEM,
    questions_user_prompt, score_user_prompt,
)
from app.ai.schemas_self_assessment import GeneratedQuestions, ReadinessScore
from app.db.session import session_scope
from slowapi import Limiter
from slowapi.util import get_remote_address




router = APIRouter(prefix="/self-assessment", tags=["self-assessment"])
limiter = Limiter(key_func=get_remote_address)










@router.post("/{bill_id}/start")
@limiter.limit("5/minute")
async def start_assessment(request: Request, bill_id: uuid.UUID) -> dict:
    """Generate assessment questions for a bill. Returns session_id + questions list."""
    async with session_scope() as db:
        bill_row = (await db.execute(
            text("SELECT id, title, bill_number, jurisdiction FROM bills WHERE id = :id"),
            {"id": bill_id},
        )).mappings().first()

        assessment_row = (await db.execute(
            text("""
                SELECT verdict, compliance_cost_estimate, affected_operations, triggering_clause_text
                FROM assessments WHERE bill_id = :bid ORDER BY created_at DESC LIMIT 1
            """),
            {"bid": bill_id},
        )).mappings().first()

    if bill_row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bill not found")

    bill = dict(bill_row)
    assessment = dict(assessment_row) if assessment_row else {}

    generated: GeneratedQuestions = await reason(
        task="self_assessment_questions",
        capability=Capability.FAST_CHEAP,
        schema=GeneratedQuestions,
        system_prompt=QUESTIONS_SYSTEM,
        user_prompt=questions_user_prompt(bill, assessment),
        run_id=None,
        cache=True,
    )

    session_id = str(uuid.uuid4())

    async with session_scope() as db:
        await db.execute(
            text("""
                INSERT INTO self_assessments (id, bill_id, session_id, answers)
                VALUES (:id, :bill_id, :session_id, '[]')
            """),
            {"id": uuid.uuid4(), "bill_id": bill_id, "session_id": session_id},
        )

    return {
        "session_id": session_id,
        "questions": [q.model_dump() for q in generated.questions],
    }


class ScoreRequest(BaseModel):
    session_id: str
    answers: list[dict]  # [{question_id, question, answer}]


@router.post("/{bill_id}/score")
@limiter.limit("5/minute")
async def score_assessment(
    request: Request,
    bill_id: uuid.UUID,
    body: ScoreRequest,
) -> dict:
    """Score the self-assessment answers. Returns ReadinessScore."""
    async with session_scope() as db:
        bill_row = (await db.execute(
            text("SELECT id, title, bill_number, jurisdiction FROM bills WHERE id = :id"),
            {"id": bill_id},
        )).mappings().first()
        assessment_row = (await db.execute(
            text("""
                SELECT verdict, compliance_cost_estimate, affected_operations
                FROM assessments WHERE bill_id = :bid ORDER BY created_at DESC LIMIT 1
            """),
            {"bid": bill_id},
        )).mappings().first()

    if bill_row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Bill not found")

    bill = dict(bill_row)
    assessment = dict(assessment_row) if assessment_row else {}

    scored: ReadinessScore = await reason(
        task="self_assessment_score",
        capability=Capability.DEEP_REASONING,
        schema=ReadinessScore,
        system_prompt=SCORE_SYSTEM,
        user_prompt=score_user_prompt(bill, assessment, body.answers),
        run_id=None,
        cache=False,
    )

    async with session_scope() as db:
        await db.execute(
            text("""
                UPDATE self_assessments
                SET answers = :answers, score = :score, industry_avg = :avg,
                    cost_to_close = :ctc, gaps_found = :gaps, recommendation = :rec
                WHERE session_id = :session_id
            """),
            {
                "answers": json.dumps(body.answers),
                "score": scored.score,
                "avg": scored.industry_average,
                "ctc": scored.cost_to_close,
                "gaps": json.dumps(scored.gaps_identified),
                "rec": scored.recommendation,
                "session_id": body.session_id,
            },
        )

    return scored.model_dump()
