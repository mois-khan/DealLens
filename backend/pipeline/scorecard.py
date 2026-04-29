from services.gemini_client import call_gemini, parse_json, FLASH_LITE
from prompts.scorecard import SYSTEM as SCORECARD_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def compute_scorecard(all_flags: dict, claims: dict) -> dict:
    """
    F8 — Deal scorecard aggregator. Uses Flash-Lite (NOT Flash) — simple aggregation task.
    Computes overall score and 5 dimension scores from the full analysis.
    Returns the scorecard dict.
    """
    user_prompt = (
        f"FULL ANALYSIS:\n{all_flags}\n\n"
        f"STARTUP CLAIMS:\n{claims}"
    )

    response_text = await call_gemini(
        system=SCORECARD_SYSTEM,
        user=user_prompt,
        model=FLASH_LITE,  # Intentionally Flash-Lite — preserve Flash quota
        max_tokens=1024,
    )

    result = parse_json(response_text)
    logger.info(f"[scorecard] Overall score: {result.get('overall')}")
    return result
