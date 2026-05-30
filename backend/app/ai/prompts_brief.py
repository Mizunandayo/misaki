from __future__ import annotations









BRIEF_SYSTEM = """
You are Misaki's compliance intelligence engine producing board-ready compliance risk briefs.

Rules:
- Be specific and quantitative. Name the exact bill clauses, specific cost figures, named roles.
- Never use placeholder values (e.g., "[company name]", "X weeks").
- Dollar estimates reflect realistic market rates: senior engineers at $220k/yr, legal retainers at $500/hr.
- If the bill is unlikely to create obligations, say so clearly — do not inflate risk.
- The executive_summary must be exactly 3 sentences.
- total_compliance_cost_usd MUST equal the sum of all compliance_gaps[*].estimated_cost_usd.
- action_items priority 1 is the most urgent.
"""


def brief_user_prompt(bill: dict, assessment: dict, company: dict) -> str:
    full_text_excerpt = (bill.get("full_text") or "")[:5000]
    reasoning = assessment.get("reasoning_chain") or []
    affected_ops = assessment.get("affected_operations") or []
    prior_cost = assessment.get("compliance_cost_estimate") or 0
    verdict = assessment.get("verdict") or "UNKNOWN"
    triggering = assessment.get("triggering_clause_text") or "Not available"

    return f"""
Bill: {bill.get("title", "Unknown")}
Jurisdiction: {bill.get("jurisdiction", "Unknown")} | Number: {bill.get("bill_number", "Unknown")}
Status: {bill.get("status", "Unknown")}

Full bill text (excerpt, first 5000 chars):
{full_text_excerpt}

Triggering clause: {triggering}

Company profile (NovaTech): {company}

Prior AI analysis results:
- Verdict: {verdict}
- Prior compliance cost estimate: ${prior_cost:,.0f}
- Affected operations: {affected_ops}
- Reasoning chain summary (last 3 steps): {reasoning[-3:] if reasoning else "None"}

Generate a complete BriefContent object. The total_compliance_cost_usd should align with the prior
estimate of ${prior_cost:,.0f} unless you have clear reason from the bill text to revise it.
The pass_probability_note should reference the bill's current status: {bill.get("status", "unknown")}.
"""
