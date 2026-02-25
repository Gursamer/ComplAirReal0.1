from __future__ import annotations

import json
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.config import settings
from app.llm import generate_with_fallback
from app.storage.db import get_report_meta
from app.utils.auth import AuthUser, get_optional_current_user

router = APIRouter(tags=["chat"])


class ChatInput(BaseModel):
    report_id: str = Field(min_length=3, max_length=128)
    question: str = Field(min_length=2, max_length=2000)


class ChatOutput(BaseModel):
    answer: str
    citations: list[str]
    provider: str
    grounded: bool = True


@router.post("/chat", response_model=ChatOutput)
def chat(payload: ChatInput, current_user: AuthUser | None = Depends(get_optional_current_user)) -> ChatOutput:
    report = _load_report(payload.report_id, current_user)
    clauses = list(report.get("clauses", []))
    risks = {str(r.get("clause_id", "")): r for r in report.get("risk_scores", [])}
    matches = report.get("gdpr_matches", [])

    ranked = _rank_clauses(payload.question, clauses, risks)
    context_rows: list[str] = []
    citations: list[str] = []
    for clause in ranked[:3]:
        cid = str(clause.get("clause_id", ""))
        risk = risks.get(cid, {})
        issues = "; ".join((risk.get("issues") or [])[:2])
        context_rows.append(
            f"{cid} | {clause.get('title', 'Clause')} | score={risk.get('risk_score', 0)} | issues={issues}"
        )
        clause_cites = [m.get("article", "") for m in matches if str(m.get("clause_id", "")) == cid]
        citations.extend([c for c in clause_cites if c])

    context = "\n".join(context_rows) if context_rows else "No strong clause matches found."
    unique_citations = _unique(citations)[:5]
    prompt = (
        "You are a compliance copilot. Answer the user question using only the provided report context. "
        "Be concise, factual, and practical. If evidence is weak, say so.\n\n"
        f"Question: {payload.question}\n\n"
        f"Context:\n{context}\n\n"
        f"Citations: {', '.join(unique_citations) if unique_citations else 'None'}\n\n"
        "Answer in 3-6 sentences."
    )
    llm = generate_with_fallback(prompt, temperature=0.15, max_tokens=220)
    answer = llm.text.strip() or "I could not produce a grounded answer from this report."
    if unique_citations:
        answer += f"\n\nSources: {', '.join(unique_citations)}"
    return ChatOutput(answer=answer, citations=unique_citations, provider=llm.provider, grounded=True)


def _load_report(report_id: str, current_user: AuthUser | None) -> dict:
    meta = get_report_meta(report_id)
    if meta and meta.get("owner_email") and current_user and meta.get("owner_email") != current_user.email:
        raise HTTPException(status_code=404, detail="Report not found")
    report_path = Path(str(meta.get("report_path"))) if meta and meta.get("report_path") else settings.report_path / f"{report_id}.json"
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    try:
        return json.loads(report_path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Invalid report payload: {exc}") from exc


def _rank_clauses(question: str, clauses: list[dict], risks: dict[str, dict]) -> list[dict]:
    terms = _terms(question)
    scored = []
    for clause in clauses:
        text = f"{clause.get('title', '')} {clause.get('text', '')}".lower()
        score = sum(2 for t in terms if t in text)
        risk = risks.get(str(clause.get("clause_id", "")), {})
        score += int(risk.get("risk_score", 0)) // 25
        scored.append((score, clause))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [row[1] for row in scored if row[0] > 0]


def _terms(text: str) -> list[str]:
    return [t for t in re.split(r"[^a-zA-Z0-9]+", text.lower()) if len(t) > 2]


def _unique(items: list[str]) -> list[str]:
    seen = set()
    out = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out
