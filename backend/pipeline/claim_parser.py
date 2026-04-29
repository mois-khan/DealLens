from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.extraction import SYSTEM as EXTRACTION_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def extract_claims(raw_text: str) -> dict:
    """
    F1 — Use Gemini Flash to extract all verifiable claims from the deck text.
    Returns a structured claim manifest dict.
    """
    user_prompt = f"Here is the pitch deck text to analyse:\n\n{raw_text}"

    response_text = await call_gemini(
        system=EXTRACTION_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=4096,
    )

    claims = parse_json(response_text)
    logger.info(f"[claim_parser] Extracted claims for: {claims.get('startup_name', 'unknown')}")
    return claims
