import asyncio
import logging
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile

from db.supabase_client import get_report, save_report
from services.crunchbase_client import get_person
from services.serper_client import search_serper
from services.tavily_client import search_tavily

logger = logging.getLogger(__name__)

router = APIRouter()

# File size limit — 20MB (rules.md §8)
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024


# ── POST /analyse ──────────────────────────────────────────────────────────────

@router.post("/analyse")
async def analyse_deck(file: Annotated[UploadFile, File(description="Pitch deck PDF, max 20MB")]):
    """
    Accepts a PDF pitch deck and runs the full DealLens analysis pipeline.

    Steps:
      1. Validate file type and size
      2. Extract text from PDF (pipeline/extractor.py)
      3. Extract structured claims from text via Gemini Flash (F1)
      4. Parallel web research — Tavily + Serper + Crunchbase
      5. Parallel AI analysis — F2 TAM, F3 Traction, F4 Moat, F5 Founder, F6 Financials
      6. Question generation — F7 (Gemini Flash)
      7. Scorecard aggregation — F8 (Gemini Flash-Lite)
      8. Assemble report, persist to Supabase, return JSON
    """
    # ── Validation: file type ──────────────────────────────────────────────────
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="File must be a PDF.")

    # ── Validation: file size (read once, then work with bytes) ────────────────
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=422,
            detail=f"File exceeds 20MB limit ({len(pdf_bytes) // (1024 * 1024)}MB uploaded).",
        )

    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    # ── Step 1: PDF text extraction ────────────────────────────────────────────
    from pipeline.extractor import extract_text
    raw_text = extract_text(pdf_bytes)
    
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text. PDF may be image-based.")
    
    logger.info(f"[analyse] PDF received: '{filename}' ({len(pdf_bytes)} bytes). Text extracted.")

    # ── Step 2: Extract claims (Gemini Flash - F1) ─────────────────────────────
    from pipeline.claim_parser import extract_claims
    claims = await extract_claims(raw_text)

    # TEMPORARY: Return claims directly so the user can verify F1 output as requested
    return {"status": "success", "f1_claims": claims}


# ── GET /report/{report_id} ────────────────────────────────────────────────────

@router.get("/report/{report_id}")
async def get_report_by_id(report_id: str):
    """
    Fetches a previously generated report by its UUID.

    Returns 404 for unknown IDs — never 500 (rules.md §8).
    UUID format validation is handled inside get_report() — invalid UUIDs return None.
    """
    report = await get_report(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report
