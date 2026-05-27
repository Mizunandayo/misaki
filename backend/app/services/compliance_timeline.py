"""
Compliance Timeline Estimator.

Produces a Gantt strip and cost-of-delay math used by the bill detail
page and (Day 5) the PDF brief.
"""



from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(slots=True)
class TimelineMilestone:
    day: int
    label: str
    owner: str


@dataclass(slots=True)
class ComplianceTimeline:
    days_remaining: int | None
    milestones: list[TimelineMilestone]
    cost_of_delay_per_week_usd: int
    industry_benchmark_days: int
    pace_gap_weeks: int


STANDARD_MILESTONES: list[TimelineMilestone] = [
    TimelineMilestone(day=0,   label="Bill passes / effective date set", owner="Legislative"),
    TimelineMilestone(day=14,  label="Legal review complete",            owner="Legal"),
    TimelineMilestone(day=45,  label="Architecture decision",            owner="Engineering"),
    TimelineMilestone(day=90,  label="Implementation complete",          owner="Engineering"),
    TimelineMilestone(day=120, label="Internal audit + sign-off",        owner="Security"),
    TimelineMilestone(day=142, label="Compliance deadline",              owner="Legal"),
]


def estimate(
    *,
    compliance_cost_estimate_usd: int,
    effective_date: datetime | None,
    industry_benchmark_days: int = 180,
) -> ComplianceTimeline:
    now = datetime.now(timezone.utc)
    days_remaining = (
        (effective_date.date() - now.date()).days if effective_date else None
    )
    weeks = max(1, len(STANDARD_MILESTONES) * 3)
    cost_of_delay_per_week = round(compliance_cost_estimate_usd * 0.15 / weeks)
    pace_gap_weeks = (
        max(0, (industry_benchmark_days - (days_remaining or 0)) // 7)
        if days_remaining is not None
        else 0
    )
    return ComplianceTimeline(
        days_remaining=days_remaining,
        milestones=STANDARD_MILESTONES,
        cost_of_delay_per_week_usd=cost_of_delay_per_week,
        industry_benchmark_days=industry_benchmark_days,
        pace_gap_weeks=pace_gap_weeks,
    )
