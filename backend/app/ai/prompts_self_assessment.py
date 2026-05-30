from __future__ import annotations

QUESTIONS_SYSTEM = """
You are a compliance readiness assessment engine.
Generate targeted yes/no or short-answer questions that evaluate a company's
readiness to comply with a specific bill. Questions should be specific to the
bill's actual requirements — not generic compliance questions.
Each question should have a category (e.g. "Data Storage", "Incident Response").
"""


def questions_user_prompt(bill: dict, assessment: dict) -> str:
    verdict = assessment.get("verdict", "UNKNOWN")
    gaps = assessment.get("affected_operations", [])
    triggering = assessment.get("triggering_clause_text", "Not available")
    return f"""
Bill: {bill.get("title", "Unknown")} ({bill.get("jurisdiction")} {bill.get("bill_number")})
Verdict: {verdict}
Triggering clause: {triggering}
Affected operations: {gaps}

Generate 5 targeted questions that assess NovaTech's specific readiness to comply with this bill.
Focus on the areas the assessment flagged. Each question must be answerable with yes/no or 1-2 sentences.
"""


SCORE_SYSTEM = """
You are a compliance scoring engine.
Based on the company's answers, determine their compliance readiness score.
Be realistic and tough — most companies are NOT ready.
"""


def score_user_prompt(bill: dict, assessment: dict, answers: list[dict]) -> str:
    return f"""
Bill: {bill.get("title", "Unknown")}
Compliance cost estimate: ${assessment.get("compliance_cost_estimate", 0):,.0f}
Company profile: NovaTech — Series C SaaS, 280 employees, Austin TX

Company's self-assessment answers:
{answers}

Score their readiness 0–100. Industry average for Series C SaaS: 41%.
Identify the specific gaps revealed by their answers.
cost_to_close = sum of estimated costs to close the identified gaps.
grade: A=90+, B=75+, C=55+, D=40+, F=below 40.
"""
