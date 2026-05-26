from __future__ import annotations

from functools import lru_cache
from typing import Any

from langchain_mcp_adapters.client import MultiServerMCPClient

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger(__name__)







@lru_cache(maxsize=1)
def _build_client() -> MultiServerMCPClient:
    return MultiServerMCPClient(
        {
            "brightdata": {
                "url": str(settings.BRIGHT_DATA_MCP_URL),
                "transport": "sse",
                "headers": {
                    "Authorization": (
                        f"Bearer {settings.BRIGHT_DATA_API_TOKEN.get_secret_value()}"
                    )
                },
            }
        }
    )


async def get_mcp_tools() -> list[Any]:
    """Return the list of LangChain BaseTools instances exposed by the
    Bright Data MCP Server (Web unlocker, scraping browser, serp api, webscaper api)"""
    client = _build_client()
    tools = await client.get_tools()
    log.info("mcp_tools_loaded", count=len(tools), names=[t.name for t in tools])
    return tools




async def scrape_url(url: str, *, render_js: bool = False) -> str:
    tools = await get_mcp_tools()
    tool_name = "scraping_browser_navigate" if render_js else "scrape_as_markdown"

    tool = next((t for t in tools if t.name == tool_name), None)
    if tool is None:
        raise RuntimeError(
            f"Bright Data tool '{tool_name}' not found. "
            f"Available: {[t.name for t in tools]}"
        )

    log.info("mcp_scrape", url=url, tool=tool_name)
    result = await tool.ainvoke({"url": url})
    return str(result)
