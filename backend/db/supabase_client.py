import os
import logging
import asyncio
from typing import Optional
from uuid import UUID
from supabase import create_async_client, AsyncClient

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

_sb: Optional[AsyncClient] = None

async def get_supabase() -> AsyncClient:
    global _sb
    if _sb is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase environment variables are missing.")
        _sb = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
    return _sb

def _is_valid_uuid(val: str) -> bool:
    try:
        UUID(str(val))
        return True
    except ValueError:
        return False


# ── Async CRUD Operations ──────────────────────────────────────────────────────

async def save_report(report: dict) -> str:
    try:
        sb = await get_supabase()
        startup_name = report.get("scorecard", {}).get("startup_name", "Unknown")
        file_name = report.get("file_name", "unknown.pdf")
        overall_score = report.get("scorecard", {}).get("overall", 0.0)

        response = await sb.table("analyses").insert({
            "startup_name": startup_name,
            "file_name": file_name,
            "report": report,
            "overall_score": overall_score,
        }).execute()
        
        if not response.data or len(response.data) == 0:
            raise ValueError("Supabase insert succeeded but returned no data.")
        
        report_id = response.data[0]["id"]
        logger.info(f"[supabase] Report saved successfully: {report_id}")
        return report_id
    except Exception as e:
        logger.error(f"[supabase] Failed to save report: {e}")
        raise

async def save_submission(data: dict) -> str:
    try:
        sb = await get_supabase()
        response = await sb.table("analyses").insert({
            "startup_name": data.get("startup_name", "Unknown"),
            "file_name": data.get("file_name", "unknown.pdf"),
            "report": data.get("report", {}),
            "overall_score": None,
            "status": data.get("status", "pending"),
            "category": data.get("category"),
            "short_description": data.get("short_description"),
            "founder_email": data.get("founder_email"),
            "raw_text": data.get("raw_text"),
        }).execute()
        
        if not response.data or len(response.data) == 0:
            raise ValueError("Supabase insert succeeded but returned no data.")
        
        report_id = response.data[0]["id"]
        logger.info(f"[supabase] Submission saved successfully: {report_id}")
        return report_id
    except Exception as e:
        logger.error(f"[supabase] Failed to save submission: {e}")
        raise

async def get_report(report_id: str) -> Optional[dict]:
    if not _is_valid_uuid(report_id):
        logger.warning(f"[supabase] Invalid UUID format requested: {report_id}")
        return None
    try:
        sb = await get_supabase()
        response = await sb.table("analyses").select("*").eq("id", report_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]["report"]
        return None
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch report {report_id}: {e}")
        return None

async def get_full_record(report_id: str) -> Optional[dict]:
    if not _is_valid_uuid(report_id):
        return None
    try:
        sb = await get_supabase()
        response = await sb.table("analyses").select("*").eq("id", report_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch full record {report_id}: {e}")
        return None

async def get_all_deals() -> list[dict]:
    try:
        sb = await get_supabase()
        response = await sb.table("analyses").select(
            "id, created_at, startup_name, file_name, overall_score, status, category, short_description, founder_email"
        ).order("created_at", desc=True).execute()
        return response.data or []
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch deals: {e}")
        return []

async def update_report_status(report_id: str, status: str) -> bool:
    if not _is_valid_uuid(report_id):
        return False
    try:
        sb = await get_supabase()
        response = await sb.table("analyses").update({"status": status}).eq("id", report_id).execute()
        return bool(response.data)
    except Exception as e:
        logger.error(f"[supabase] Failed to update status: {e}")
        return False

async def update_report_data(report_id: str, updates: dict) -> bool:
    if not _is_valid_uuid(report_id):
        return False
    try:
        sb = await get_supabase()
        response = await sb.table("analyses").update(updates).eq("id", report_id).execute()
        return bool(response.data)
    except Exception as e:
        logger.error(f"[supabase] Failed to update report data: {e}")
        return False

async def get_preferences() -> dict:
    try:
        sb = await get_supabase()
        response = await sb.table("investor_preferences").select("*").limit(1).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return {"interested_categories": [], "disqualified_categories": []}
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch preferences: {e}")
        return {"interested_categories": [], "disqualified_categories": []}

async def save_preferences(interested: list[str], disqualified: list[str]) -> dict:
    try:
        sb = await get_supabase()
        existing = await get_preferences()
        
        data = {
            "interested_categories": interested,
            "disqualified_categories": disqualified,
        }
        
        if existing and existing.get("id"):
            response = await sb.table("investor_preferences").update(data).eq("id", existing["id"]).execute()
        else:
            response = await sb.table("investor_preferences").insert(data).execute()
        
        return response.data[0] if response.data else {}
    except Exception as e:
        logger.error(f"[supabase] Failed to save preferences: {e}")
        raise

async def delete_report(report_id: str) -> bool:
    if not _is_valid_uuid(report_id):
        return False
    try:
        sb = await get_supabase()
        await sb.table("analyses").delete().eq("id", report_id).execute()
        return True
    except Exception as e:
        logger.error(f"[supabase] Failed to delete report {report_id}: {e}")
        return False
