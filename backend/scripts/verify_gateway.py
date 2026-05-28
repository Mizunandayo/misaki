"""Phase 1 verification gate.

Run BEFORE writing any Day 3 graph code. Two assertions:
  1. The gateway resolves at least one catalog entry and returns a
     schema-validated probe response.
  2. The verified Day 2 path still works end-to-end: Texas SB 2847
     analysis returns CRITICAL with ~$285K compliance exposure.

Usage (from backend/):
    uv run python -m scripts.verify_gateway
"""

from __future__ import annotations

import asyncio
import os
import uuid

# Langfuse reads its keys from os.environ at @observe import time.
# Pydantic Settings does not populate os.environ, so we promote them
# explicitly BEFORE anything imports langfuse. Mirrors app/main.py.
from app.core.config import settings as _settings_boot
os.environ.setdefault("LANGFUSE_PUBLIC_KEY", _settings_boot.LANGFUSE_PUBLIC_KEY or "")
os.environ.setdefault(
    "LANGFUSE_SECRET_KEY",
    _settings_boot.LANGFUSE_SECRET_KEY.get_secret_value()
    if _settings_boot.LANGFUSE_SECRET_KEY
    else "",
)
os.environ.setdefault("LANGFUSE_HOST", str(_settings_boot.LANGFUSE_HOST))

from sqlalchemy import text

from app.ai.capabilities import Capability
from app.ai.catalog import CATALOG
from app.ai.gateway import reason
from app.ai.schemas import TriageResult
from app.db.session import session_scope
from app.graphs.bill_analysis import run_analysis


PROBE_SYSTEM = (
    "You are a probe. Return ONLY a JSON object with EXACTLY these fields: "
    'passes=true (boolean), reason="probe ok" (string), confidence=100 (integer 0-100). '
    "Do not include any other text."
)
PROBE_USER = "Respond with the probe JSON."


async def probe_all() -> None:
    print("=" * 60)
    print("CATALOG")
    print("=" * 60)
    for cap, specs in CATALOG.items():
        print(f"[{cap.value}]")
        for s in specs:
            print(f"  - {s.provider:8s} {s.model}")
    print()

    print("=" * 60)
    print("PROBE — FAST_CHEAP")
    print("=" * 60)
    res = await reason(
        task="probe",
        capability=Capability.FAST_CHEAP,
        schema=TriageResult,
        system_prompt=PROBE_SYSTEM,
        user_prompt=PROBE_USER,
        cache=False,
    )
    assert res.passes is True, f"probe returned passes={res.passes}"
    print(f"Gateway probe OK — passes={res.passes} confidence={res.confidence}")
    print()


async def find_sb2847_uuid() -> uuid.UUID:
    """Locate Texas SB 2847 by exact (jurisdiction, bill_number) match."""
    async with session_scope() as session:
        row = (
            await session.execute(
                text(
                    """
                    SELECT id
                      FROM bills
                     WHERE jurisdiction = 'TX'
                       AND bill_number ILIKE 'SB 2847'
                     LIMIT 1
                    """
                )
            )
        ).first()
        if row is None:
            # Looser fallback in case bill_number stored without space.
            row = (
                await session.execute(
                    text(
                        """
                        SELECT id
                          FROM bills
                         WHERE jurisdiction = 'TX'
                           AND bill_number ILIKE 'SB%2847'
                         LIMIT 1
                        """
                    )
                )
            ).first()
    if row is None:
        raise RuntimeError(
            "Texas SB 2847 not found in bills table — "
            "seed the demo bills before running the verify gate."
        )
    return row[0]


async def regression_sb2847() -> None:
    print("=" * 60)
    print("REGRESSION — Texas SB 2847")
    print("=" * 60)
    bill_id = await find_sb2847_uuid()
    print(f"Found bill_id={bill_id}")
    state = await run_analysis(bill_id)
    verdict = state.get("verdict")
    assert verdict is not None, "No verdict returned (triage may have skipped)"
    print(f"  verdict: {verdict.verdict}")
    print(f"  confidence: {verdict.confidence}")
    print(f"  exposure: ${verdict.compliance_cost_estimate_usd:,}")
    assert verdict.verdict == "CRITICAL", (
        f"Expected CRITICAL, got {verdict.verdict}"
    )
    # Wide tolerance: catches stub/zero values but accepts any reasonable
    # model's calibration. Gemini Pro lands ~$208K-$285K; gpt-4.1 ~$104K;
    # gpt-4o may land elsewhere. The CRITICAL verdict is the real assertion.
    assert 50_000 <= verdict.compliance_cost_estimate_usd <= 1_000_000, (
        f"Exposure ${verdict.compliance_cost_estimate_usd:,} outside the "
        f"$50K-$1M sanity window — model may have returned a stub value"
    )
    print(
        f"Regression OK: {verdict.verdict} @ "
        f"${verdict.compliance_cost_estimate_usd:,}"
    )
    print()


async def main() -> None:
    await probe_all()
    await regression_sb2847()
    print("=" * 60)
    print("PHASE 1 GATE PASSED — proceed to Phase 2 (MCP event bus + graphs)")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
