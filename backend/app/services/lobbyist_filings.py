"""Cross-reference lobbyist filings for a tracked bill."""



from __future__ import annotations
import re
import uuid
from typing import Any
from sqlalchemy import text
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.toolbox import call_tool


log = get_logger(__name__)



_OPENSECRETS = "https://www.opensecrets.org/federal-lobbying/bills/summary?id={bn}"












def _classify_position(snippet: str) -> str:
    s = snippet.lower()
    if any(k in s for k in ("support", "in favor", "endorse")):
        return "FOR"
    if any(k in s for k in ("oppose", "against", "kill")):
        return "AGAINST"
    return "NEUTRAL"


async def refresh_for_bill(
    *,
    run_id: uuid.UUID,
    bill_id: uuid.UUID,
    bill_number: str,
) -> int:
    """Scrape OpenSecrets for this bill, upsert filings, return row count."""
    url = _OPENSECRETS.format(bn=bill_number.replace(" ", "+"))
    page = await call_tool(
        run_id=run_id,
        tool_name="scrape_as_markdown",
        args={"url": url},
        summarize=f"OpenSecrets lookup for {bill_number}",
    )
    page_str = page if isinstance(page, str) else str(page)

    rows: list[dict[str, Any]] = []
    pattern = re.compile(
        r"([A-Z][A-Za-z0-9 .,&\-]{2,80})\s+\$([\d,]{4,})\s+(\d{4})\s*([A-Z]{0,1}[\w \-]{0,40})?"
    )
    for m in pattern.finditer(page_str):
        org = m.group(1).strip()
        amount = int(m.group(2).replace(",", ""))
        snippet = (m.group(4) or "")
        rows.append({
            "org": org,
            "amount_usd": amount,
            "position": _classify_position(snippet),
            "source_url": url,
        })
        if len(rows) >= 60:
            break

    if not rows:
        log.info("lobbyist_no_rows_parsed", bill_id=str(bill_id))
        return 0

    async with session_scope() as session:
        for r in rows:
            await session.execute(
                text(
                    """
                    INSERT INTO lobbyist_filings
                       (bill_id, organization, amount_usd, position, source_url)
                    VALUES (:bid, :org, :amt, :pos, :url)
                    """
                ),
                {
                    "bid": bill_id,
                    "org": r["org"][:200],
                    "amt": r["amount_usd"],
                    "pos": r["position"],
                    "url": r["source_url"],
                },
            )
    return len(rows)
