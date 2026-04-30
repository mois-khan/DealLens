import os
import logging

import httpx

logger = logging.getLogger(__name__)

# Validate key at startup (rules.md §11)
_API_KEY = os.getenv("SERPER_API_KEY")
if not _API_KEY:
    raise RuntimeError("SERPER_API_KEY environment variable is not set.")

_SERPER_URL = "https://google.serper.dev/search"


async def search_serper(query: str, num: int = 10) -> list[dict]:
    """
    Returns Google results as structured JSON via Serper.
    Use for: competitor lists, funding news, press coverage (architecture.md §7).

    Edge cases handled:
    - Timeout after 10s: returns empty list, pipeline continues (rules.md §9)
    - Non-200 HTTP response: returns empty list, logs the status code
    - Network failure: returns empty list, never crashes pipeline
    - Empty query string: returns empty list immediately
    """
    if not query or not query.strip():
        logger.warning("[Serper] Empty query received, skipping search.")
        return []

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                _SERPER_URL,
                headers={"X-API-KEY": _API_KEY},
                json={"q": query, "num": num},
            )
            response.raise_for_status()
            return response.json().get("organic", [])
    except httpx.TimeoutException:
        logger.error(f"[Serper] Request timed out for query: '{query}'")
        return []
    except httpx.HTTPStatusError as e:
        logger.error(f"[Serper] HTTP {e.response.status_code} for query '{query}': {e}")
        return []
    except Exception as e:
        # Any other failure must never crash the pipeline (rules.md §9)
        logger.error(f"[Serper] Search failed for query '{query}': {e}")
        return []
