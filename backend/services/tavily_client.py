from tavily import TavilyClient
from dotenv import load_dotenv
import os
import asyncio
import logging

load_dotenv()

logger = logging.getLogger(__name__)

_client: TavilyClient | None = None


def _get_client() -> TavilyClient:
    global _client
    if _client is None:
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise RuntimeError("TAVILY_API_KEY must be set in .env")
        _client = TavilyClient(api_key=api_key)
    return _client


async def search_tavily(query: str, max_results: int = 5) -> list[dict]:
    """
    Returns full page content — not just snippets.
    Use for: market reports, founder news, full article content.
    Free tier: 1,000 searches/month.
    """
    try:
        client = _get_client()
        loop = asyncio.get_event_loop()
        result = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                lambda: client.search(
                    query=query,
                    max_results=max_results,
                    include_raw_content=True,
                ),
            ),
            timeout=10.0,
        )
        return result.get("results", [])
    except asyncio.TimeoutError:
        logger.warning(f"[tavily] Timeout on query: {query}")
        return []
    except Exception as e:
        logger.warning(f"[tavily] Error: {e}")
        return []
