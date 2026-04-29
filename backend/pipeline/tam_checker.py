from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.tam_validation import SYSTEM as TAM_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def check_tam(market_claims: list[dict], tavily_results: list[dict]) -> dict:
    """
    F2 — TAM reality check.
    Compares the founder's market size claim against real Tavily search results.
    Returns a verdict dict.
    """
    if not market_claims:
        return {
            "verdict": "UNSUBSTANTIATED",
            "claimed_tam": "—",
            "real_tam": "—",
            "inflation_factor": None,
            "explanation": "No market size claims found in the deck.",
            "source": "—",
            "investor_question": "What is your total addressable market and how did you calculate it?",
        }

    user_prompt = (
        f"FOUNDER'S MARKET CLAIMS:\n{market_claims}\n\n"
        f"WEB RESEARCH DATA:\n{tavily_results}"
    )

    response_text = await call_gemini(
        system=TAM_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=1024,
    )

    result = parse_json(response_text)
    logger.info(f"[tam_checker] Verdict: {result.get('verdict')}")
    return result
