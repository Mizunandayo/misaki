"""
LangGraph Bill Analysis Pipeline (Graph 1).

   Ingest ──▶ Triage ──▶ Applicability ──▶ Probability ──▶ END
                │
                └──(skip)──▶ END

Each node is async, traced by Langfuse, and writes its outputs into
the shared BillAnalysisState. Graph 2 (Agentic Response) is wired
on Day 3 and consumes the same state plus the assessment row.
"""

from __future__ import annotations
import json
import uuid
from typing import Any, TypedDict, cast
from langfuse import observe
from langgraph.graph import END, START, StateGraph
from sqlalchemy import select
from app.ai.capabilities import Capability
from app.ai.embeddings import compute_embedding
from app.ai.gateway import reason
from app.ai.prompts import (
    APPLICABILITY_SYSTEM,
    APPLICABILITY_USER,
    TRIAGE_SYSTEM,
    TRIAGE_USER,
)
from app.ai.schemas import (
    ApplicabilityVerdict,
    PassProbabilityResult,
    TriageResult,
)
from app.core.logging import get_logger
from app.db.session import session_scope
from app.models import Bill, CompanyProfile
from app.services.pass_probability import score as score_probability
from app.services.precedent_search import find_precedents


log = get_logger(__name__)

DEMO_COMPANY_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")





class BillAnalysisState(TypedDict, total=False):
    bill_id: uuid.UUID
    company_id: uuid.UUID
    bill: dict[str, Any]
    profile: dict[str, Any]
    embedding: list[float]
    precedents: list[dict[str, Any]]
    triage: TriageResult
    triage_passed: bool
    verdict: ApplicabilityVerdict
    probability: PassProbabilityResult
    error: str | None





# NODES


@observe(name="graph.ingest")
async def ingest_node(state: BillAnalysisState) -> dict[str, Any]:
    bill_id = state["bill_id"]
    company_id = state.get("company_id", DEMO_COMPANY_ID)

    async with session_scope() as session:
        bill_row = (
            await session.execute(select(Bill).where(Bill.id == bill_id))
        ).scalar_one_or_none()
        if bill_row is None:
            return {"error": f"Bill {bill_id} not found"}

        profile_row = (
            await session.execute(
                select(CompanyProfile).where(CompanyProfile.id == company_id)
            )
        ).scalar_one_or_none()
        if profile_row is None:
            return {"error": f"Company {company_id} not found"}

        bill_text = bill_row.full_text or bill_row.title
        if bill_row.embedding is None and bill_text:
            embedding = await compute_embedding(bill_text)
            bill_row.embedding = embedding
            await session.flush()
        elif bill_row.embedding is not None:
            # pgvector returns a numpy array — convert to list for downstream code
            embedding = list(bill_row.embedding)
        else:
            embedding = []

        precedents = (
            await find_precedents(
                session,
                target_bill_id=bill_id,
                embedding=embedding,
                k=3,
            )
            if embedding
            else []
        )

        bill_dict = {
            "id": str(bill_row.id),
            "jurisdiction": bill_row.jurisdiction,
            "bill_number": bill_row.bill_number,
            "title": bill_row.title,
            "full_text": bill_row.full_text or "",
            "status": bill_row.status,
        }
        profile_dict = {
            "name": profile_row.name,
            "industry_tags": list(profile_row.industry_tags or []),
            "jurisdictions": list(profile_row.jurisdictions or []),
            "headcount": profile_row.headcount,
            "revenue_band": profile_row.revenue_band,
            "data_handling_classification": profile_row.data_handling_classification,
            "compliance_certifications": list(profile_row.compliance_certifications or []),
        }

    return {
        "bill": bill_dict,
        "profile": profile_dict,
        "embedding": embedding,
        "precedents": precedents,
        "company_id": company_id,
    }


@observe(name="graph.triage")
async def triage_node(state: BillAnalysisState) -> dict[str, Any]:
    if state.get("error"):
        return {"triage_passed": False}

    bill = state["bill"]
    profile = state["profile"]

    result = await reason(
        task="triage",
        capability=Capability.FAST_CHEAP,
        schema=TriageResult,
        system_prompt=TRIAGE_SYSTEM,
        user_prompt=TRIAGE_USER.format(
            profile_json=json.dumps(profile, ensure_ascii=False, default=str),
            jurisdiction=bill["jurisdiction"],
            bill_number=bill["bill_number"],
            title=bill["title"],
            bill_text_excerpt=bill["full_text"][:3000],
        ),
    )
    return {"triage": result, "triage_passed": result.passes}


@observe(name="graph.applicability")
async def applicability_node(state: BillAnalysisState) -> dict[str, Any]:
    bill = state["bill"]
    profile = state["profile"]
    precedents = state.get("precedents", [])

    precedent_block = (
        "\n".join(
            f"- {p['jurisdiction']} {p['bill_number']}: {p['title']} "
            f"(similarity {p['similarity']:.2f})"
            for p in precedents
        )
        if precedents
        else "No semantically similar precedents in database yet."
    )

    verdict = await reason(
        task="applicability",
        capability=Capability.DEEP_REASONING,
        schema=ApplicabilityVerdict,
        system_prompt=APPLICABILITY_SYSTEM,
        user_prompt=APPLICABILITY_USER.format(
            profile_json=json.dumps(profile, ensure_ascii=False, default=str),
            precedent_block=precedent_block,
            jurisdiction=bill["jurisdiction"],
            bill_number=bill["bill_number"],
            title=bill["title"],
            bill_text=bill["full_text"][:24000],
        ),
    )
    return {"verdict": verdict}


@observe(name="graph.probability")
async def probability_node(state: BillAnalysisState) -> dict[str, Any]:
    bill = state["bill"]
    async with session_scope() as session:
        probability = await score_probability(
            session,
            bill_id=uuid.UUID(bill["id"]),
            bill_title=bill["title"],
            jurisdiction=bill["jurisdiction"],
            status=bill["status"],
        )
    return {"probability": probability}



# PERSISTENCE


async def persist_results(state: BillAnalysisState) -> uuid.UUID | None:
    """Write the final assessment row. Returns assessment_id or None."""
    if state.get("error") or not state.get("verdict"):
        return None

    bill_id = state["bill_id"]
    company_id = state["company_id"]
    verdict = state["verdict"]
    probability = state.get("probability")

    async with session_scope() as session:
        from sqlalchemy import text
        await session.execute(
            text(
                """
                INSERT INTO assessments (
                  bill_id, company_id, verdict, confidence, reasoning_chain,
                  triggering_clause_text, triggering_clause_location,
                  compliance_cost_estimate, affected_operations, comparable_bills
                ) VALUES (
                  :bill_id, :company_id, :verdict, :confidence, CAST(:rc AS jsonb),
                  :tct, :tcl, :cost, CAST(:ao AS jsonb), CAST(:cb AS jsonb)
                )
                ON CONFLICT (bill_id, company_id) DO UPDATE SET
                  verdict = EXCLUDED.verdict,
                  confidence = EXCLUDED.confidence,
                  reasoning_chain = EXCLUDED.reasoning_chain,
                  triggering_clause_text = EXCLUDED.triggering_clause_text,
                  triggering_clause_location = EXCLUDED.triggering_clause_location,
                  compliance_cost_estimate = EXCLUDED.compliance_cost_estimate,
                  affected_operations = EXCLUDED.affected_operations,
                  comparable_bills = EXCLUDED.comparable_bills
                RETURNING id
                """
            ),
            {
                "bill_id": bill_id,
                "company_id": company_id,
                "verdict": verdict.verdict,
                "confidence": verdict.confidence,
                "rc": json.dumps([s.model_dump() for s in verdict.reasoning_chain]),
                "tct": verdict.triggering_clause_text,
                "tcl": verdict.triggering_clause_location,
                "cost": verdict.compliance_cost_estimate_usd,
                "ao": json.dumps([o.model_dump() for o in verdict.affected_operations]),
                "cb": json.dumps(state.get("precedents", []), default=str),
            },
        )

        if probability is not None:
            await session.execute(
                text(
                    "UPDATE bills SET pass_probability = :p, "
                    "urgency_score = :u WHERE id = :id"
                ),
                {
                    "p": probability.score,
                    "u": _compute_urgency(verdict, probability),
                    "id": bill_id,
                },
            )
    return bill_id


def _compute_urgency(
    verdict: ApplicabilityVerdict,
    probability: PassProbabilityResult,
) -> int:
    weight = {"CRITICAL": 1.0, "HIGH": 0.8, "MEDIUM": 0.5, "LOW": 0.2, "NOT_APPLICABLE": 0}
    base = weight.get(verdict.verdict, 0) * 100
    return min(100, round(base * 0.6 + probability.score * 0.4))



# GRAPH WIRING


def _should_continue(state: BillAnalysisState) -> str:
    if state.get("error"):
        return END
    return "applicability" if state.get("triage_passed") else END


def build_graph():
    g = StateGraph(BillAnalysisState)
    g.add_node("ingest", ingest_node)
    g.add_node("triage", triage_node)
    g.add_node("applicability", applicability_node)
    g.add_node("probability", probability_node)

    g.add_edge(START, "ingest")
    g.add_edge("ingest", "triage")
    g.add_conditional_edges("triage", _should_continue, ["applicability", END])
    g.add_edge("applicability", "probability")
    g.add_edge("probability", END)
    return g.compile()


GRAPH = build_graph()


async def run_analysis(
    bill_id: uuid.UUID,
    *,
    company_id: uuid.UUID = DEMO_COMPANY_ID,
) -> BillAnalysisState:
    initial: BillAnalysisState = {"bill_id": bill_id, "company_id": company_id}
    final_state = await GRAPH.ainvoke(initial)
    typed = cast(BillAnalysisState, final_state)
    await persist_results(typed)
    return typed
