from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.traction import SYSTEM as TRACTION_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def validate_traction(traction_claims: list[dict]) -> dict:
    """
    F3 — Traction credibility validator.
    Reviews traction claims for red flags (missing retention, vanity metrics, etc.)
    Returns a dict with a flags list.
    """
    if not traction_claims:
        return {"flags": []}

    user_prompt = f"TRACTION CLAIMS FROM DECK:\n{traction_claims}"

    response_text = await call_gemini(
        system=TRACTION_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=1024,
    )

    result = parse_json(response_text)
    logger.info(f"[traction_validator] Flags found: {len(result.get('flags', []))}")
    return result
