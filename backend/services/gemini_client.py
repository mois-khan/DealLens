import os
import re
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


# ── Model Pool ────────────────────────────────────────────────────────────────
# PERMANENT SOLUTION: Load-balance across MULTIPLE models.
# Google's free tier limit is 20 RPD *per model per project*.
# By using N models × K keys, we get N × K × 20 requests per day.
#
# IMPORTANT: Only include models that are CONFIRMED to have free tier quota > 0.
# Models like gemini-2.0-flash and gemini-2.0-flash-lite have limit: 0 on free
# tier and MUST NOT be included — they waste retry attempts.
#
# Confirmed working models with free tier (as of 2026-05-05):
#   - gemini-2.5-flash-lite   → 20 RPD free tier ✓
#   - gemini-2.5-flash        → 20 RPD free tier ✓ (but often 503 under load)
#   - gemini-flash-latest     → maps to gemini-3-flash, 20 RPD ✓
#   - gemini-flash-lite-latest → 20 RPD ✓
#   - gemini-3.1-flash-lite-preview → 20 RPD ✓
#   - gemini-3-flash-preview  → 20 RPD ✓

MODEL_POOL = [
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
]
# With 6 models × 2 keys = 240 RPD (enough for ~40 full pipeline runs/day)
# Adding more API keys multiplies this linearly.

_CURRENT_MODEL_INDEX = 0

def _get_next_model() -> str:
    global _CURRENT_MODEL_INDEX
    model = MODEL_POOL[_CURRENT_MODEL_INDEX]
    _CURRENT_MODEL_INDEX = (_CURRENT_MODEL_INDEX + 1) % len(MODEL_POOL)
    return model

# Default model constants — the actual model used may change at runtime via rotation
FLASH      = MODEL_POOL[0]
FLASH_LITE = MODEL_POOL[0]


# ── Retry Delay Extraction ────────────────────────────────────────────────────

def _extract_retry_delay(err_str: str) -> int:
    """
    Extracts the suggested retry delay (in seconds) from a Gemini error message.
    Example: 'Please retry in 47.653416745s.' → 48
    Returns a minimum of 5 seconds if no delay is found.
    """
    match = re.search(r'retry in (\d+(?:\.\d+)?)s', err_str)
    if match:
        return int(float(match.group(1))) + 2  # Add 2s buffer
    return 5  # Default fallback


# ── Core Gemini Call ──────────────────────────────────────────────────────────

def _call_sync(model_name: str, system: str, user: str, max_tokens: int) -> str:
    """
    Blocking Gemini call with TRIPLE rotation strategy:
      1. Rotate API key
      2. Rotate model
      3. Wait the API-suggested retry delay before final retry

    This ensures that even if all keys × models are exhausted in quick
    succession, we wait the exact amount Google tells us and retry once more.
    """
    config = types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=max_tokens,
        temperature=0.1,
        response_mime_type="application/json",
    )

    total_combos = len(_CLIENT_POOL) * len(MODEL_POOL)
    # We try every key×model combo, then do ONE final retry round after waiting
    max_attempts = total_combos + len(MODEL_POOL)

    for attempt in range(max_attempts):
        client = _get_next_client()
        try:
            # Handle multi-modal input (PDF bytes fallback)
            content_parts = user
            if isinstance(user, bytes):
                content_parts = [
                    types.Part.from_bytes(data=user, mime_type="application/pdf"),
                    "Extract all text and structured data from this PDF."
                ]

            response = client.models.generate_content(
                model=model_name,
                contents=content_parts,
                config=config,
            )
            logger.info(f"[Gemini] ✓ Success with model={model_name} on attempt {attempt+1}")
            return response.text
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower()
            is_unavailable = "503" in err_str or "UNAVAILABLE" in err_str
            is_retryable = is_rate_limit or is_unavailable or "403" in err_str or "PERMISSION_DENIED" in err_str

            if not is_retryable:
                # Non-retryable error (bad prompt, auth error, etc.) — fail fast
                logger.error(f"[Gemini] Non-retryable error: {err_str}")
                raise

            logger.warning(f"[Gemini] Attempt {attempt+1}/{max_attempts} failed | model={model_name} | {'RATE_LIMIT' if is_rate_limit else 'UNAVAILABLE'}")

            if attempt < total_combos:
                # Phase 1: Quick rotation through all key×model combos
                model_name = _get_next_model()
                time.sleep(1)  # Brief pause between rotations
            else:
                # Phase 2: All combos exhausted. Respect the API's suggested delay.
                retry_delay = _extract_retry_delay(err_str)
                logger.warning(f"[Gemini] All combos exhausted. Waiting {retry_delay}s (API-suggested delay)...")
                time.sleep(retry_delay)
                model_name = _get_next_model()

    raise RuntimeError("Gemini failed after exhausting all keys, models, and retries.")


async def call_gemini(
    system: str,
    user: str,
    model: str = None,
    max_tokens: int = 8192,
) -> str:
    """Async wrapper that runs the blocking call in a thread pool."""
    # Always start with the next model from the pool for load balancing
    if model is None:
        model = _get_next_model()
    return await asyncio.to_thread(_call_sync, model, system, user, max_tokens)


def parse_json(text: str) -> dict:
    """Defensively strips markdown and parses JSON."""
    original = text
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]).strip()
    try:
        parsed = json.loads(text)
        # Defensive check: if Gemini returns a list instead of a dict, take the first item
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed[0]
        elif isinstance(parsed, list):
            return {}
        return parsed
    except json.JSONDecodeError as e:
        logger.error(f"[Gemini] JSON parse failed: {e}\nRaw response:\n{original}")
        raise
