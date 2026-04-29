from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.financials import SYSTEM as FINANCIALS_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def detect_financial_flags(financial_claims: list[dict]) -> dict:
    """
    F6 — Financial red flag detector.
    Reviews financial projections and claims for credibility issues.
    Returns a dict with a flags list (strings).
    """
    if not financial_claims:
        return {"flags": []}

    user_prompt = f"FINANCIAL CLAIMS FROM DECK:\n{financial_claims}"

    response_text = await call_gemini(
        system=FINANCIALS_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=1024,
    )

    result = parse_json(response_text)
    logger.info(f"[financial_flags] Flags found: {len(result.get('flags', []))}")
    return result
