import os
import asyncio
import json
import time
import logging
from typing import List

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# ── Multi-Key Management ──────────────────────────────────────────────────────

def _load_clients() -> List[genai.Client]:
    """
    Scans environment for all GEMINI_API_KEY_x variables and initializes clients.
    If none found, falls back to the standard GEMINI_API_KEY.
    """
    keys = []
    # Check for GEMINI_API_KEY_1, _2, _3...
    for i in range(1, 11):
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key:
            keys.append(key)
    
    # Fallback to single key if no numbered keys exist
    if not keys:
        single_key = os.getenv("GEMINI_API_KEY")
        if single_key:
            keys.append(single_key)
            
    if not keys:
        raise RuntimeError("No Gemini API keys found in environment. Please set GEMINI_API_KEY_1, etc.")
    
    logger.info(f"[Gemini] Initialized client pool with {len(keys)} API keys.")
    return [genai.Client(api_key=k) for k in keys]

# Global pool of clients
_CLIENT_POOL = _load_clients()
_CURRENT_KEY_INDEX = 0

def _get_next_client() -> genai.Client:
    global _CURRENT_KEY_INDEX
    client = _CLIENT_POOL[_CURRENT_KEY_INDEX]
    # Rotate index for the next call (Round Robin)
    _CURRENT_KEY_INDEX = (_CURRENT_KEY_INDEX + 1) % len(_CLIENT_POOL)
    return client

# ── Model Constants ────────────────────────────────────────────────────────────

# Using 3.1 Flash Lite for the highest free-tier quota (500 RPD)
FLASH      = "gemini-3.1-flash-lite-preview"
FLASH_LITE = "gemini-3.1-flash-lite-preview"


def _call_sync(model_name: str, system: str, user: str, max_tokens: int) -> str:
    """
    Blocking Gemini call with Key Rotation + Exponential Backoff.
    If a key hits a limit, we immediately rotate to the next key.
    """
    config = types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=max_tokens,
        temperature=0.1,
    )

    for attempt in range(len(_CLIENT_POOL) + 1):  # Try each key at least once
        client = _get_next_client()
        try:
            response = client.models.generate_content(
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
            
            if is_retryable and attempt < len(_CLIENT_POOL):
                # We have more keys to try! Rotate and try again immediately.
                logger.warning(f"[Gemini] Key {_CURRENT_KEY_INDEX} busy/limited. Rotating to next key (Attempt {attempt+1})...")
                continue
            elif is_retryable:
                # We've exhausted all keys in this burst. Final wait.
                wait = 10
                logger.warning(f"[Gemini] All keys in pool exhausted. Waiting {wait}s...")
                time.sleep(wait)
            else:
                # Critical error (e.g. invalid prompt)
                raise

    raise RuntimeError("Gemini failed after exhausting all keys and retries.")


async def call_gemini(
    system: str,
    user: str,
    model: str = FLASH,
    max_tokens: int = 2048,
) -> str:
    """Async wrapper that runs the blocking call in a thread pool."""
    return await asyncio.to_thread(_call_sync, model, system, user, max_tokens)


def parse_json(text: str) -> dict:
    """Defensively strips markdown and parses JSON."""
    original = text
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"[Gemini] JSON parse failed: {e}\nRaw response:\n{original}")
        raise
