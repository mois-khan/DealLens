from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Lazy singleton — created on first use so env vars are guaranteed to be loaded
_sb: Client | None = None


def _get_client() -> Client:
    global _sb
    if _sb is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
        _sb = create_client(url, key)
    return _sb


async def save_report(report: dict) -> str:
    """Insert a report into the analyses table. Returns the UUID string."""
    sb = _get_client()
    response = (
        sb.table("analyses")
        .insert(
            {
                "startup_name": report.get("scorecard", {}).get("startup_name", "Unknown"),
                "file_name": report.get("file_name", ""),
                "report": report,
                "overall_score": report.get("scorecard", {}).get("overall", 0),
            }
        )
        .execute()
    )
    report_id = response.data[0]["id"]
    logger.info(f"[supabase] Report saved: {report_id}")
    return report_id


async def get_report(report_id: str) -> dict | None:
    """Fetch a report by UUID. Returns None if not found."""
    sb = _get_client()
    response = (
        sb.table("analyses")
        .select("*")
        .eq("id", report_id)
        .execute()
    )
    if response.data:
        return response.data[0]["report"]
    return None
