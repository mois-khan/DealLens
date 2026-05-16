from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import re
from db.supabase_client import get_supabase, create_profile, get_profile_by_handle, get_profile_by_id

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

@router.post("/signup")
async def signup(req: SignupRequest):
    sb = await get_supabase()
    
    # 1. Sign up user in Supabase Auth
    auth_response = await sb.auth.sign_up({
        "email": req.email,
        "password": req.password
    })
    
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed.")
    
    user_id = auth_response.user.id
    
    # 2. Generate Handle
    base_handle = slugify(req.full_name)
    handle = base_handle
    counter = 1
    
    # Simple uniqueness check
    while await get_profile_by_handle(handle):
        handle = f"{base_handle}-{counter}"
        counter += 1
    
    # 3. Create Profile
    try:
        profile = await create_profile(
            user_id=user_id,
            full_name=req.full_name,
            handle=handle,
            email=req.email
        )
        return {
            "user": auth_response.user,
            "session": auth_response.session,
            "profile": profile
        }
    except Exception as e:
        # Rollback auth if profile creation fails? 
        # For a hackathon, we'll just log it.
        raise HTTPException(status_code=500, detail=f"Profile creation failed: {e}")

@router.post("/login")
async def login(req: LoginRequest):
    sb = await get_supabase()
    auth_response = await sb.auth.sign_in_with_password({
        "email": req.email,
        "password": req.password
    })
    
    if not auth_response.session:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    
    profile = await get_profile_by_id(auth_response.user.id)
    
    return {
        "user": auth_response.user,
        "session": auth_response.session,
        "profile": profile
    }

@router.get("/me")
async def get_me(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")
    
    token = authorization.replace("Bearer ", "")
    sb = await get_supabase()
    
    user_response = await sb.auth.get_user(token)
    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    profile = await get_profile_by_id(user_response.user.id)
    return {
        "user": user_response.user,
        "profile": profile
    }

@router.get("/handle/{handle}")
async def get_profile_handle(handle: str):
    profile = await get_profile_by_handle(handle)
    if not profile:
        raise HTTPException(status_code=404, detail="Investor not found.")
    return profile
