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

    # ── Step 3: Web Research (Tavily, Serper, Crunchbase) ─────────────────────────
    category = claims.get("category", "startup")
    startup_name = claims.get("startup_name", "startup")
    
    # Run all API requests in parallel (rules.md §6)
    tavily_task = search_tavily(f"{category} market size TAM 2025")
    serper_task = search_serper(f"{startup_name} {category} competitors alternatives")
    
    cb_tasks = []
    founders = claims.get("founders", [])
    for f in founders:
        if f.get("name"):
            cb_tasks.append(get_person(f["name"]))
            
    # Gather search results
    research_results = await asyncio.gather(tavily_task, serper_task, *cb_tasks)
    tavily_results = research_results[0]
    serper_results = research_results[1]
    cb_results = research_results[2:]

    # ── Step 4: AI Analysis (F2, F4, F5) ──────────────────────────────────────
    from pipeline.tam_checker import check_tam
    from pipeline.moat_tester import test_moat
    from pipeline.founder_intel import test_founder
    
    # Run analysis modules in parallel
    analysis_results = await asyncio.gather(
        check_tam(claims.get("market_claims", []), tavily_results),
        test_moat(claims.get("moat_claims", []), serper_results),
        test_founder(claims.get("founders", []), cb_results, tavily_results)
    )
    
    tam_r = analysis_results[0]
    moat_r = analysis_results[1]
    founder_r = analysis_results[2]

    # ── Step 5: Synthesis (F7, F8) ─────────────────────────────────────────────
    from pipeline.question_gen import generate_questions
    from pipeline.scorecard import generate_scorecard
    
    # Bundle context for synthesis
    full_context = {
        "claims": claims,
        "tam_analysis": tam_r,
        "moat_analysis": moat_r,
        "founder_analysis": founder_r
    }
    
    synthesis_results = await asyncio.gather(
        generate_questions(full_context),
        generate_scorecard(full_context)
    )
    
    questions = synthesis_results[0]
    scorecard = synthesis_results[1]

    # ── Step 6: Final Packing & Persistence ───────────────────────────────────
    # Map into the official Pydantic model (models/report.py)
    report_data = {
        "report_id": "temp", # Will be replaced after saving
        "file_name": filename,
        "scorecard": scorecard,
        "founder": founder_r,
        "claims": {
            "tam": tam_r,
            "traction": {"flags": []},  # F3 Cut for schedule
            "moat": moat_r,
            "financials": {"flags": []} # F6 Cut for schedule
        },
        "competitors": moat_r.get("competitors", []),
        "questions": questions
    }

    # Save to Supabase
    report_id = await save_report(report_data)
    report_data["report_id"] = report_id

    logger.info(f"[analyse] Analysis complete for {filename}. Report ID: {report_id}")
    return report_data


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
