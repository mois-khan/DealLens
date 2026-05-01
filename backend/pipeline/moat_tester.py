import logging
import json
from prompts.moat import SYSTEM
from services.gemini_client import call_gemini, parse_json

logger = logging.getLogger(__name__)

async def test_moat(moat_claims: list[dict], serper_results: list[dict]) -> dict:
    """
    Evaluates founder moat claims against Serper competitor research.
    Returns the verdict JSON structure.
    """
    if not moat_claims:
        logger.info("[moat_tester] No moat claims to verify. Returning default verdict.")
        return _empty_moat_verdict()

    logger.info(f"[moat_tester] Verifying {len(moat_claims)} moat claims using {len(serper_results)} search results...")

    # Format the prompt context
    user_prompt = "FOUNDER'S MOAT CLAIMS:\n"
    user_prompt += json.dumps(moat_claims, indent=2) + "\n\n"
    
    user_prompt += "WEB RESEARCH DATA (Google/Serper competitors):\n"
    if not serper_results:
        user_prompt += "No competitor data found on the web.\n"
    else:
        for res in serper_results[:5]: # Top 5 organic results
            user_prompt += f"Title: {res.get('title', '')}\n"
            user_prompt += f"Snippet: {res.get('snippet', '')}\n\n"

    try:
        response_text = await call_gemini(system=SYSTEM, user=user_prompt)
        verdict = parse_json(response_text)
        logger.info(f"[moat_tester] Validation complete. Verdict: {verdict.get('verdict', 'UNKNOWN')}")
        return verdict
    except Exception as e:
        logger.error(f"[moat_tester] Moat validation failed: {e}")
        return _empty_moat_verdict(error_msg=str(e))

def _empty_moat_verdict(error_msg: str = None) -> dict:
    return {
        "verdict": "UNSUBSTANTIATED",
        "competitors": [],
        "explanation": f"Pipeline error: {error_msg}" if error_msg else "No specific competitive moat claims were found in the pitch deck.",
        "investor_question": "What is your core sustainable competitive advantage against well-funded incumbents?"
    }
