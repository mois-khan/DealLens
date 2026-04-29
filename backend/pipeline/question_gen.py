from services.gemini_client import call_gemini, parse_json, FLASH
from prompts.questions import SYSTEM as QUESTIONS_SYSTEM
import logging

logger = logging.getLogger(__name__)


async def generate_questions(all_flags: dict, claims: dict) -> list[dict]:
    """
    F7 — Investor question generator. NEVER CUT.
    Synthesises all analysis flags and the original claims into 5 sharp investor questions.
    Returns a list of exactly 5 question dicts.
    """
    user_prompt = (
        f"FULL ANALYSIS FLAGS:\n{all_flags}\n\n"
        f"ORIGINAL CLAIMS FROM DECK:\n{claims}"
    )

    response_text = await call_gemini(
        system=QUESTIONS_SYSTEM,
        user=user_prompt,
        model=FLASH,
        max_tokens=3000,
    )

    result = parse_json(response_text)
    questions = result.get("questions", [])
    logger.info(f"[question_gen] Generated {len(questions)} questions")
    return questions
