from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime





@dataclass(slots=True, frozen=True)
class ScrapedBill:
    jurisdiction: str
    bill_number: str
    title: str
    full_text: str
    status: str
    introduced_at: datetime | None
    source_url: str





class Scraper(ABC):
    jurisdiction: str

    @abstractmethod
    async def fetch_bill_index(self) -> list[str]:
        """Return a list of bill details URLs to scrape."""

    @abstractmethod
    async def fetch_bill(self, url: str) -> ScrapedBill:
        """Scrape a single bill detail page."""
        

