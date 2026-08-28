from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import docs, code_review, agent

app = FastAPI(title="AI Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(docs.router, prefix="/docs-search", tags=["Document Search"])
app.include_router(code_review.router, prefix="/code-review", tags=["Code Review"])
app.include_router(agent.router, prefix="/agent", tags=["Agent Memory"])

@app.get("/")
def root():
    return {"status": "AI Platform backend is running"}