from __future__ import annotations

import asyncio

from sqlalchemy import select

from app.core.logging import configure_logging, get_logger
from app.db.session import session_scope
from app.models import Bill
from app.scrapers.california import CaliforniaScraper
from app.scrapers.texas import TexasScraper
from app.services.dedup import claim_new_content, compute_content_hash
from app.tasks.celery_app import celery_app






configure_logging()
log = get_logger(__name__)

SCRAPERS = {
    "TX": TexasScraper(),
    "CA": CaliforniaScraper(),
}

async def _scrape_async(jurisdiction: str) -> dict[str, int]:
    scraper = SCRAPERS.get(jurisdiction)
    if scraper is None:
        raise ValueError(f"No scraper for jurisdiction {jurisdiction}")

    urls = await scraper.fetch_bill_index()
    log.info("scrape_index_fetched", jurisdiction=jurisdiction, count=len(urls))

    inserted = 0
    skipped_dedup = 0
    failed = 0

    async with session_scope() as session:
        for url in urls:
            try:
                scraped = await scraper.fetch_bill(url)
                content_hash = compute_content_hash(scraped.full_text)

                if not await claim_new_content(content_hash):
                    skipped_dedup += 1
                    continue

                existing = await session.execute(
                    select(Bill).where(Bill.content_hash == content_hash)
                )
                if existing.scalar_one_or_none() is not None:
                    skipped_dedup += 1
                    continue

                session.add(
                    Bill(
                        jurisdiction=scraped.jurisdiction,
                        bill_number=scraped.bill_number,
                        title=scraped.title,
                        full_text=scraped.full_text,
                        status=scraped.status,
                        introduced_at=scraped.introduced_at,
                        source_url=scraped.source_url,
                        content_hash=content_hash,
                    )
                )
                inserted += 1
            except Exception as exc:
                failed += 1
                log.exception("scrape_bill_failed", url=url, error=str(exc))

    log.info(
        "scrape_complete",
        jurisdiction=jurisdiction,
        inserted=inserted,
        skipped_dedup=skipped_dedup,
        failed=failed,
    )
    return {"inserted": inserted, "skipped": skipped_dedup, "failed": failed}


@celery_app.task(name="app.tasks.scrape_bills.scrape_jurisdiction")
def scrape_jurisdiction(jurisdiction: str) -> dict[str, int]:
    """Celery entrypoint — Celery is sync, so we bridge to asyncio."""
    return asyncio.run(_scrape_async(jurisdiction))
