import httpx
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)


async def get_person(name: str) -> dict:
    """
    Founder lookup via Crunchbase API.
    Returns empty dict if not found — never crashes the pipeline.
    Activate the 7-day free trial the morning of Day 1.
    """
    if not name:
        return {}

    api_key = os.getenv("CRUNCHBASE_API_KEY")
    if not api_key:
        logger.warning("[crunchbase] CRUNCHBASE_API_KEY not set — skipping founder lookup.")
        return {}

    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://api.crunchbase.com/api/v4/searches/people",
                params={"user_key": api_key},
                json={
                    "field_ids": [
                        "first_name",
                        "last_name",
                        "primary_job_title",
                        "primary_organization",
                        "num_founded_organizations",
                    ],
                    "query": [
                        {
                            "type": "predicate",
                            "field_id": "facet_ids",
                            "operator_id": "includes",
                            "values": ["person"],
                        }
                    ],
                    "limit": 1,
                },
                timeout=10.0,
            )
            r.raise_for_status()
            return r.json()
    except httpx.TimeoutException:
        logger.warning(f"[crunchbase] Timeout looking up: {name}")
        return {}
    except Exception as e:
        logger.warning(f"[crunchbase] Error: {e}")
        return {}  # Crunchbase failure never blocks the report
