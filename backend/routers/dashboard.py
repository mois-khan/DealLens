import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth_utils import get_current_user
from db.supabase_client import (
    get_all_deals,
    update_report_status,
    delete_report,
    get_preferences,
    save_preferences,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/deals", tags=["dashboard"])


# ── GET /deals ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_deals(user = Depends(get_current_user)):
    """
    Returns all deal submissions for the authenticated investor.
    """
    deals = await get_all_deals(user.id)
    return {"deals": deals}


# ── PATCH /deals/{deal_id}/status ──────────────────────────────────────────────

class StatusUpdate(BaseModel):
    status: str  # inbox, accepted, rejected, favourite, disqualified

@router.patch("/{deal_id}/status")
async def update_deal_status(deal_id: str, body: StatusUpdate, user = Depends(get_current_user)):
    """
    Updates the status of a deal.
    """
    valid_statuses = {"pending", "inbox", "accepted", "rejected", "favourite", "disqualified"}
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{body.status}'. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Note: RLS handles the ownership check, but we could explicitly check here too.
    success = await update_report_status(deal_id, body.status)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found.")
    
    logger.info(f"[dashboard] Deal {deal_id} status updated to '{body.status}' by {user.id}")
    return {"success": True, "deal_id": deal_id, "status": body.status}

# ── DELETE /deals/{deal_id} ───────────────────────────────────────────────────

@router.delete("/{deal_id}")
async def remove_deal(deal_id: str, user = Depends(get_current_user)):
    """
    Permanently deletes a deal from the database.
    """
    success = await delete_report(deal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found or could not be deleted.")
    
    logger.info(f"[dashboard] Deal {deal_id} permanently deleted by {user.id}")
    return {"success": True, "deal_id": deal_id}


# ── Preferences ──────────────────────────────────────────────────────────────

@router.get("/preferences")
async def get_investor_preferences(user = Depends(get_current_user)):
    """
    Returns the investor's category preferences.
    """
    prefs = await get_preferences(user.id)
    return prefs

class PreferencesUpdate(BaseModel):
    interested_categories: list[str]
    disqualified_categories: list[str]

@router.post("/preferences")
async def save_investor_preferences(body: PreferencesUpdate, user = Depends(get_current_user)):
    """
    Saves/updates the investor's category preferences.
    """
    result = await save_preferences(user.id, body.interested_categories, body.disqualified_categories)
    logger.info(f"[dashboard] Preferences updated for {user.id}")
    
    # Retroactive update (limited to current user's deals)
    deals = await get_all_deals(user.id)
    interested_cats = [c.lower() for c in body.interested_categories]
    disqualified_cats = [c.lower() for c in body.disqualified_categories]
    
    for deal in deals:
        cat = (deal.get("category") or "Other").lower()
        old_status = deal.get("status")
        
        if old_status in ["inbox", "disqualified", "rejected", "pending"]:
            new_status = "inbox"
            if cat in disqualified_cats:
                new_status = "disqualified"
            elif len(interested_cats) > 0 and cat not in interested_cats:
                new_status = "rejected"
                
            if new_status != old_status:
                await update_report_status(deal["id"], new_status)
                
    return {"success": True, "preferences": result}


# ── POST /deals/{deal_id}/invite ──────────────────────────────────────────────

@router.post("/{deal_id}/invite")
async def send_meeting_invite_endpoint(deal_id: str, user = Depends(get_current_user)):
    """
    Sends a meeting invite email to the founder of a specific deal.
    """
    from db.supabase_client import get_full_record, get_profile_by_id
    from services.email_service import send_meeting_invite

    record = await get_full_record(deal_id)
    if not record:
        raise HTTPException(status_code=404, detail="Deal not found.")

    founder_email = record.get("founder_email")
    startup_name = record.get("startup_name", "Your Startup")

    if not founder_email:
        raise HTTPException(status_code=422, detail="No founder email found for this deal.")

    # Get investor's name for personal touch
    profile = await get_profile_by_id(user.id)
    sender_name = profile.get("full_name", "An Investor") if profile else "An Investor"

    # Note: send_meeting_invite might need to be updated to take sender_name
    success = await send_meeting_invite(founder_email, startup_name)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send meeting invite.")

    return {"success": True, "deal_id": deal_id, "sent_to": founder_email}
