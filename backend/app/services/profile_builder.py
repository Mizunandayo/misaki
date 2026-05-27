"""
Auto-Dossier: enter a company name, get a populated Company Intelligence
Profile built from Bright Data MCP research.

Flow:
  1. SERP API: "<name> SaaS company headquarters employees"
  2. Web Unlocker: Crunchbase profile
  3. Web Unlocker: SEC EDGAR company search (operating geographies from 10-K)
  4. SERP API: "<name> SOC2 GDPR ISO27001 compliance"
  5. Gemini Pro synthesis → AutoDossierResult
"""

from __future__ import annotations
import asyncio
import re
from langfuse import observe
from app.ai.gemini import structured_call, get_pro
from app.ai.prompts import DOSSIER_SYSTEM, DOSSIER_USER
from app.ai.schemas import AutoDossierResult
from app.core.logging import get_logger
from app.mcp.client import get_mcp_tools


log = get_logger(__name__)

NAME_PATTERN = re.compile(r"^[A-Za-z0-9 .,'&\-]{1,80}$")


def _is_safe_name(name: str) -> bool:
    """Reject names that contain shell, SQL, or prompt-injection metacharacters."""
    return bool(NAME_PATTERN.match(name.strip()))



@observe(name="profile.build")
async def build_dossier(company_name: str) -> AutoDossierResult:
    if not _is_safe_name(company_name):
        raise ValueError("Invalid company name")

    safe = company_name.strip()
    tools = await get_mcp_tools()
    serp = next((t for t in tools if t.name == "search_engine"), None)
    scrape = next((t for t in tools if t.name == "scrape_as_markdown"), None)
    if serp is None or scrape is None:
        raise RuntimeError("Required Bright Data tools not available")

    queries = [
        f"{safe} company headquarters employees revenue",
        f"{safe} SOC2 GDPR ISO27001 HIPAA compliance certification",
        f"site:sec.gov {safe} 10-K operating jurisdictions",
        f"{safe} press release data privacy regulation 2026",
    ]

    serp_calls = [serp.ainvoke({"query": q, "num_results": 5}) for q in queries]
    serp_results = await asyncio.gather(*serp_calls, return_exceptions=True)

    research_block = "\n\n".join(
        f"QUERY: {queries[i]}\nRESULTS: {str(r)[:1500]}"
        for i, r in enumerate(serp_results)
        if not isinstance(r, Exception)
    )

    dossier = await structured_call(
        get_pro(),
        schema=AutoDossierResult,
        system_prompt=DOSSIER_SYSTEM,
        user_prompt=DOSSIER_USER.format(
            company_name=safe,
            research_block=research_block[:18000],
        ),
    )
    log.info(
        "profile_built",
        name=safe,
        confidence=dossier.profile_confidence_score,
        gaps=len(dossier.profile_gaps),
    )
    return dossier