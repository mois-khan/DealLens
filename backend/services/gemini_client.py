import os
import asyncio
import json
import time
import logging
from typing import Optional

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Validate key at startup — a missing key must never silently pass (rules.md §11)
_API_KEY = os.getenv("GEMINI_API_KEY")
if not _API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

_client = genai.Client(api_key=_API_KEY)

# Model constants — update here and ONLY here (rules.md §7)
FLASH      = "gemini-3.1-flash-lite-preview"  # Use 3.1 lite for high quota (500 RPD)
FLASH_LITE = "gemini-3.1-flash-lite-preview"



def _call_sync(model_name: str, system: str, user: str, max_tokens: int) -> str:
    """
    Blocking Gemini call with 3-attempt exponential backoff on rate limits.
    Waits: 10s → 20s → 30s before giving up (rules.md §7).
    Never used directly — always called via call_gemini() thread pool.
    """
    config = types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=max_tokens,
        temperature=0.1,  # Always 0.1 — analytical consistency (architecture.md §6)
    )
    for attempt in range(3):
        try:
            response = _client.models.generate_content(
                model=model_name,
                contents=user,
                config=config,
            )
            return response.text
        except Exception as e:
            err_str = str(e)
            is_retryable = (
                "429" in err_str
                or "503" in err_str
                or "quota" in err_str.lower()
                or "RESOURCE_EXHAUSTED" in err_str
                or "UNAVAILABLE" in err_str
            )
            if is_retryable and attempt < 2:
                wait = (attempt + 1) * 10
                logger.warning(f"[Gemini] API busy or rate limit hit. Retry {attempt + 1}/3 in {wait}s...")
                time.sleep(wait)
            else:
                # Non-rate-limit errors are re-raised immediately (rules.md §7)
                raise
    raise RuntimeError("Gemini rate limit exceeded after 3 retries.")


async def call_gemini(
    system: str,
    user: str,
    model: str = FLASH,
    max_tokens: int = 2048,
) -> str:
    """
    Async wrapper around _call_sync. Runs the blocking SDK call in a thread pool
    so it never blocks FastAPI's async event loop (rules.md §6).
    """
    return await asyncio.to_thread(_call_sync, model, system, user, max_tokens)


def parse_json(text: str) -> dict:
    """
    Strips markdown code fences and parses Gemini's text output as JSON.
    Gemini sometimes wraps JSON in ```json blocks despite explicit instructions —
    we strip defensively every time (rules.md §7).

    Logs the raw response before raising so we can debug during the hackathon.
    """
    original = text
    text = text.strip()

    # Strip opening fence (handles ```json, ```JSON, ``` etc.)
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (fence open) and last line (fence close)
        text = "\n".join(lines[1:-1]).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"[Gemini] JSON parse failed: {e}\nRaw response:\n{original}")
        raise
