from dotenv import load_dotenv
load_dotenv()  # Must be first — loads .env before any service module reads os.getenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyse import router

app = FastAPI(title="DealLens API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Dev only — never open to * (rules.md §11)
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
