from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.founder import SYSTEM as FOUNDER_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def get_founder_intel(
    founders: list[dict],
    tavily_results: list[dict],
    crunchbase_results: dict,
) -> dict:
    """
    F5 — Founder intelligence.
    Synthesises Tavily news, Crunchbase profile, and deck claims into a founder brief.
    Returns structured founder dict.
    """
    if not founders:
        return {
            "name": "Unknown",
            "role": "—",
            "domain_fit": "LOW",
            "domain_fit_reason": "No founder information found in the deck.",
            "verdict": "Insufficient information to evaluate founder background.",
            "past_ventures": [],
            "credibility_signals": [],
            "red_flags": ["No founder information in deck"],
            "public_summary": "No public founder information could be retrieved.",
        }

    user_prompt = (
        f"FOUNDERS FROM DECK:\n{founders}\n\n"
        f"WEB RESEARCH (Tavily):\n{tavily_results}\n\n"
        f"CRUNCHBASE DATA:\n{crunchbase_results}"
    )

    response_text = await call_gemini(
        system=FOUNDER_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=2048,
    )

    result = parse_json(response_text)
    logger.info(f"[founder_intel] Domain fit: {result.get('domain_fit')}")
    return result
