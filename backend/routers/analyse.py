from fastapi import APIRouter, UploadFile, File, HTTPException
from pipeline.extractor import extract_text
from pipeline.claim_parser import extract_claims
from pipeline.tam_checker import check_tam
from pipeline.traction_validator import validate_traction
from pipeline.moat_tester import stress_test_moat
from pipeline.founder_intel import get_founder_intel
from pipeline.financial_flags import detect_financial_flags
from pipeline.question_gen import generate_questions
from pipeline.scorecard import compute_scorecard
from services.tavily_client import search_tavily
from services.serper_client import search_serper
from services.crunchbase_client import get_person
from db.supabase_client import save_report, get_report
import asyncio
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("/analyse")
async def analyse_deck(file: UploadFile = File(...)):

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="File must be a PDF.")

    # Read and validate file size
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=422, detail="File exceeds 20MB limit.")

    # Step 1 — Extract text
    try:
        raw_text = extract_text(pdf_bytes)
    except Exception as e:
        logger.error(f"[extractor] {e}")
        raise HTTPException(status_code=500, detail="Analysis failed at module: extractor.")

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from this PDF. The file may be image-based.",
        )

    # Step 2 — Extract claims (Gemini Flash)
    try:
        claims = await extract_claims(raw_text)
    except Exception as e:
        logger.error(f"[claim_parser] {e}")
        raise HTTPException(status_code=500, detail="Analysis failed at module: claim_parser.")

    # Step 3 — Parallel data fetch
    founder_name = claims["founders"][0]["name"] if claims.get("founders") else ""
    category = claims.get("category", "startup")

    try:
        tavily_results, serper_results, crunchbase_results = await asyncio.gather(
            search_tavily(f"{category} market size India 2025 TAM"),
            search_serper(f"{category} India startup competitors funded 2025"),
            get_person(founder_name),
        )
    except Exception as e:
        logger.error(f"[data_fetch] {e}")
        # Non-fatal — continue with empty data
        tavily_results, serper_results, crunchbase_results = [], [], {}

    # Step 4 — Parallel module analysis (Gemini Flash)
    try:
        tam_r, traction_r, moat_r, founder_r, finance_r = await asyncio.gather(
            check_tam(claims.get("market_claims", []), tavily_results),
            validate_traction(claims.get("traction_claims", [])),
            stress_test_moat(claims.get("moat_claims", []), serper_results),
            get_founder_intel(claims.get("founders", []), tavily_results, crunchbase_results),
            detect_financial_flags(claims.get("financial_claims", [])),
        )
    except Exception as e:
        logger.error(f"[module_analysis] {e}")
        raise HTTPException(status_code=500, detail="Analysis failed at module: module_analysis.")

    # Step 5 — Synthesis (Gemini Flash)
    all_flags = {
        "tam": tam_r,
        "traction": traction_r,
        "moat": moat_r,
        "founder": founder_r,
        "financials": finance_r,
    }
    try:
        questions = await generate_questions(all_flags, claims)
    except Exception as e:
        logger.error(f"[question_gen] {e}")
        raise HTTPException(status_code=500, detail="Analysis failed at module: question_gen.")

    # Step 6 — Scorecard (Gemini Flash-Lite)
    try:
        scorecard = await compute_scorecard(all_flags, claims)
    except Exception as e:
        logger.error(f"[scorecard] {e}")
        raise HTTPException(status_code=500, detail="Analysis failed at module: scorecard.")

    # Step 7 — Assemble + store
    report = {
        "scorecard": scorecard,
        "founder": founder_r,
        "claims": {
            "tam": tam_r,
            "traction": traction_r,
            "moat": moat_r,
            "financials": finance_r,
        },
        "competitors": moat_r.get("competitors", []),
        "questions": questions,
        "file_name": file.filename,
    }

    try:
        report_id = await save_report(report)
    except Exception as e:
        logger.error(f"[supabase] {e}")
        raise HTTPException(status_code=500, detail="Analysis failed at module: supabase_client.")

    return {"report_id": report_id, **report}


@router.get("/report/{report_id}")
async def get_report_by_id(report_id: str):
    try:
        report = await get_report(report_id)
    except Exception as e:
        logger.error(f"[supabase_fetch] {e}")
        raise HTTPException(status_code=404, detail="Report not found.")

    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    return report
