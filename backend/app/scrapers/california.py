"""California Legislative Information scraper."""
from __future__ import annotations

import re
from datetime import datetime

from app.mcp.client import scrape_url
from app.scrapers.base import ScrapedBill, Scraper

class CaliforniaScraper(Scraper):
    jurisdiction = "CA"
    INDEX_URL = (
        "https://leginfo.legislature.ca.gov/faces/billSearchClient.xhtml"
    )
    BILL_URL_PATTERN = re.compile(
        r"https://leginfo\.legislature\.ca\.gov/faces/billNavClient\.xhtml\?bill_id=\w+"
    )

    async def fetch_bill_index(self) -> list[str]:
        markdown = await scrape_url(self.INDEX_URL, render_js=True)
        urls = self.BILL_URL_PATTERN.findall(markdown)
        return list(dict.fromkeys(urls))[:25]

    async def fetch_bill(self, url: str) -> ScrapedBill:
        markdown = await scrape_url(url, render_js=True)

        bill_id = re.search(r"bill_id=(\w+)", url)
        bill_number = bill_id.group(1).split("_")[-1] if bill_id else "UNKNOWN"

        title_match = re.search(r"##?\s*(.+)", markdown)
        title = title_match.group(1).strip() if title_match else "Untitled"

        return ScrapedBill(
            jurisdiction=self.jurisdiction,
            bill_number=bill_number,
            title=title[:512],
            full_text=markdown,
            status="introduced",
            introduced_at=datetime.utcnow(),
            source_url=url,
        )