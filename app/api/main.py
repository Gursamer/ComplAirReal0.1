from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analyze import router as analyze_router
from app.api.routes.reports import router as reports_router


app = FastAPI(
    title="ComplyAI API",
    version="0.1.0",
    description="API wrapper for ComplyAI GDPR analysis pipeline.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(reports_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
