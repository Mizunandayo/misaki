"""EU AI Act tracker — scrapes EUR-Lex delegated acts and stores them as bills. Run daily as a scheduled task."""

from __future__ import annotations
import hashlib
import re
import uuid
from datetime import datetime, timezone
from sqlalchemy import text
from app.core.logging import get_logger
from app.db.session import session_scope
from app.mcp.toolbox import call_tool

log = get_logger(__name__)









EURLEX_SEARCH = (
    "https://eur-lex.europa.eu/search.html"
    "?qid=ai-act-delegated&text=artificial+intelligence+act"
    "&scope=EURLEX&type=quick&lang=en"
)







async def refresh(run_id: uuid.UUID) -> int:
    page = await call_tool(
        run_id=run_id,
        tool_name="scrape_as_markdown",
        args={"url": EURLEX_SEARCH},
        summarize="EU AI Act EUR-Lex search",
    )
    if not isinstance(page, str):
        return 0

    hits = re.findall(
        r"(?P<title>(?:Regulation|Directive|Decision)[^\n]{10,200})\n.*?(?P<url>https?://eur-lex\.europa\.eu/legal-content/[^\s)]+)",
        page,
        re.DOTALL,
    )

    inserted = 0
    now = datetime.now(timezone.utc)
    for title, url in hits[:40]:
        title = title.strip()[:300]
        celex = re.search(r"CELEX[%:]?(\d[A-Z]\d+)", url)
        bill_number = f"EU-AIA-{celex.group(1)}" if celex else f"EU-AIA-{hashlib.md5(url.encode()).hexdigest()[:10]}"
        content_hash = hashlib.sha256(f"{bill_number}|{title}".encode()).hexdigest()

        async with session_scope() as session:
            await session.execute(
                text(
                    """
                    INSERT INTO bills
                       (jurisdiction, bill_number, title, status,
                        introduced_at, source_url, content_hash)
                    VALUES ('EU-AIA', :bn, :title, 'introduced',
                            :now, :url, :hash)
                    ON CONFLICT (content_hash) DO NOTHING
                    """
                ),
                {
                    "bn": bill_number,
                    "title": title,
                    "now": now,
                    "url": url,
                    "hash": content_hash,
                },
            )
        inserted += 1
    log.info("eu_ai_act_refresh", inserted=inserted)
    return inserted
