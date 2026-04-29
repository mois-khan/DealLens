from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import asyncio
import json
import time
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Lazy singleton — created on first use so env vars are guaranteed to be loaded
_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY must be set in .env")
        _client = genai.Client(api_key=api_key)
    return _client

FLASH = "gemini-2.5-flash"            # Primary — complex reasoning (500 RPD)
FLASH_LITE = "gemini-2.5-flash-lite"  # Secondary — simple tasks (1,000 RPD)


def _call_sync(model_name: str, system: str, user: str, max_tokens: int = 2048) -> str:
    """Sync Gemini call with 3-attempt exponential backoff on rate limit (429)."""
    client = _get_client()
    config = types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=max_tokens,
        temperature=0.1,  # Always 0.1 — analytical consistency
    )
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user,
                config=config,
            )
            return response.text
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower() or "RESOURCE_EXHAUSTED" in str(e):
                wait = (attempt + 1) * 10
                logger.warning(f"[Gemini] Rate limit hit. Retry {attempt + 1}/3 in {wait}s...")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Gemini rate limit exceeded after 3 retries.")


async def call_gemini(
    system: str,
    user: str,
    model: str = FLASH,
    max_tokens: int = 2048,
) -> str:
    """Async wrapper — runs the sync Gemini call in a thread pool executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _call_sync, model, system, user, max_tokens)


def parse_json(text: str) -> dict:
    """
    Strip markdown code fences and parse JSON.
    Gemini sometimes wraps output in ```json blocks despite instructions.
    Logs raw text on failure for debugging.
    """
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json or ```) and last line (```)
        text = "\n".join(lines[1:-1])
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"[parse_json] Failed to parse Gemini response: {e}\nRaw: {text[:500]}")
        raise
