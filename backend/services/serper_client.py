import httpx
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)


async def search_serper(query: str, num: int = 10) -> list[dict]:
    """
    Google results as clean JSON. Fast, broad.
    Use for: competitor names, funding news, press coverage.
    Free tier: 2,500 queries.
    """
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": os.getenv("SERPER_API_KEY")},
                json={"q": query, "num": num},
                timeout=10.0,
            )
            r.raise_for_status()
            return r.json().get("organic", [])
    except httpx.TimeoutException:
        logger.warning(f"[serper] Timeout on query: {query}")
        return []
    except Exception as e:
        logger.warning(f"[serper] Error: {e}")
        return []
