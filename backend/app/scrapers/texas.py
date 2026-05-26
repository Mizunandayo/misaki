"""Texas Legislature scraper. Uses Bright Data Web Unlocker."""
from __future__ import annotations

import re
from datetime import datetime

from app.mcp.client import scrape_url
from app.scrapers.base import ScrapedBill, Scraper




class TexasScraper(Scraper):
    jurisdiction = "TX"
    INDEX_URL = "https://capitol.texas.gov/Reports/Report.aspx?LegSess=89R&ID=housefiled"
    BILL_URL_PATTERN = re.compile(
        r"https://capitol\.texas\.gov/BillLookup/Text\.aspx\?LegSess=89R&Bill=\w+"
    )



    async def fetch_bill_index(self) -> list[str]:
        markdown = await scrape_url(self.INDEX_URL, render_js=False)
        urls = self.BILL_URL_PATTERN.findall(markdown)
        return list(dict.fromkeys(urls))[:25]  # cap for Day 1 sanity

    async def fetch_bill(self, url: str) -> ScrapedBill:
        markdown = await scrape_url(url, render_js=False)

        bill_number_match = re.search(r"Bill=(\w+)", url)
        bill_number = bill_number_match.group(1) if bill_number_match else "UNKNOWN"

        title_match = re.search(r"#\s*(.+)", markdown)
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