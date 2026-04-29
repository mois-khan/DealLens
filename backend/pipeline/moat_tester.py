from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.moat import SYSTEM as MOAT_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def stress_test_moat(moat_claims: list[dict], serper_results: list[dict]) -> dict:
    """
    F4 — Moat stress test.
    Maps real competitors from Serper and evaluates the founder's moat claims.
    Returns verdict + competitor list.
    """
    if not moat_claims:
        return {
            "verdict": "UNSUBSTANTIATED",
            "claimed_moat": "—",
            "explanation": "No moat claims found in the deck.",
            "investor_question": "What is your defensible competitive advantage?",
            "competitors": [],
        }

    user_prompt = (
        f"FOUNDER'S MOAT CLAIMS:\n{moat_claims}\n\n"
        f"COMPETITOR SEARCH RESULTS:\n{serper_results}"
    )

    response_text = await call_gemini(
        system=MOAT_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=2048,
    )

    result = parse_json(response_text)
    logger.info(f"[moat_tester] Verdict: {result.get('verdict')}, Competitors: {len(result.get('competitors', []))}")
    return result
