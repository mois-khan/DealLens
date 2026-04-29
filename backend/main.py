from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyse import router
from dotenv import load_dotenv
import logging
import os

load_dotenv()

# Validate required environment variables at startup
REQUIRED_ENV_VARS = [
    "GEMINI_API_KEY",
    "TAVILY_API_KEY",
    "SERPER_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
]

for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise RuntimeError(f"Missing required environment variable: {var}")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

app = FastAPI(title="DealLens API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
