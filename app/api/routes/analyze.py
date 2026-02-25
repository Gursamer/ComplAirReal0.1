from __future__ import annotations

import json
import re
import zipfile
from html import unescape
from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile
from xml.etree import ElementTree

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config import settings
from app.pipeline.extract_clauses import extract_clauses
from app.pipeline.rag_match import match_clauses_by_profile
from app.pipeline.regulations import resolve_profile
from app.pipeline.report import create_report, save_report
from app.pipeline.risk_score import score_risks
from app.pipeline.run_pipeline import run
from app.pipeline.suggest_fixes import suggest_fixes
from app.storage.db import upsert_document, upsert_report
from app.utils.auth import AuthUser, get_optional_current_user
from app.utils.hashing import sha256_text


router = APIRouter(tags=["analyze"])


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    profile: str = Form("gdpr"),
    current_user: AuthUser | None = Depends(get_optional_current_user),
) -> dict:
    filename = file.filename or ""
    lowered = filename.lower()
    resolved_profile = resolve_profile(profile)
    if not lowered.endswith((".pdf", ".txt", ".docx")):
        raise HTTPException(status_code=400, detail="Supported files: PDF, DOCX, TXT.")

    tmp_path: Path | None = None
    try:
        payload = await file.read()
        if not payload:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if lowered.endswith(".pdf"):
            with NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(payload)
                tmp_path = Path(tmp.name)
            report_path = Path(run(str(tmp_path), profile=resolved_profile.key))
        else:
            text = _extract_text_from_non_pdf(payload=payload, filename=filename)
            report_path = _run_text_pipeline(text=text, source_file=filename, profile=resolved_profile.key)

        if not report_path.exists():
            raise HTTPException(status_code=500, detail="Report file was not generated.")

        report_json = json.loads(report_path.read_text(encoding="utf-8"))
        report_json["source_file"] = filename
        report_json["analysis_profile"] = resolved_profile.key
        report_json["regulations"] = resolved_profile.regulations
        report_path.write_text(json.dumps(report_json, indent=2), encoding="utf-8")
        _persist_workspace_records(
            report_json=report_json,
            report_path=report_path,
            source_file=filename,
            owner_email=current_user.email if current_user else None,
        )
        return report_json
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
    finally:
        if tmp_path and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


def _extract_text_from_non_pdf(payload: bytes, filename: str) -> str:
    lowered = filename.lower()

    if lowered.endswith(".txt"):
        return payload.decode("utf-8", errors="ignore")

    if lowered.endswith(".docx"):
        try:
            with zipfile.ZipFile(BytesIO(payload)) as zf:
                xml = zf.read("word/document.xml").decode("utf-8", errors="ignore")
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Could not parse DOCX file: {exc}") from exc

        return _extract_docx_text_from_xml(xml)

    raise HTTPException(status_code=400, detail="Unsupported file type")


def _extract_docx_text_from_xml(xml: str) -> str:
    # Prefer structured XML parsing to avoid leaking raw DOCX markup into clauses.
    try:
        root = ElementTree.fromstring(xml)
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        lines: list[str] = []
        for para in root.findall(".//w:p", ns):
            parts: list[str] = []
            for node in para.findall(".//w:t", ns):
                if node.text:
                    parts.append(node.text)
            line = " ".join(parts).strip()
            if line:
                lines.append(line)
        text = "\n".join(lines).strip()
        if text:
            return text
    except Exception:
        pass

    # Fallback: strip tags if the XML parser cannot recover.
    scrubbed = re.sub(r"<[^>]+>", " ", xml)
    scrubbed = unescape(scrubbed)
    scrubbed = re.sub(r"\s+", " ", scrubbed).strip()
    return scrubbed


def _run_text_pipeline(text: str, source_file: str, profile: str) -> Path:
    doc_hash = sha256_text(text)[:16]
    resolved_profile = resolve_profile(profile)
    clauses = extract_clauses(text)
    matches = match_clauses_by_profile(clauses, profile=resolved_profile.key)
    risks = score_risks(clauses, matches, profile=resolved_profile.key)
    fixes = suggest_fixes(clauses, matches, risks)
    report = create_report(
        source_file=source_file,
        document_hash=doc_hash,
        analysis_profile=resolved_profile.key,
        regulations=resolved_profile.regulations,
        clauses=clauses,
        matches=matches,
        risks=risks,
        fixes=fixes,
    )
    return save_report(report, settings.report_path)


def _persist_workspace_records(report_json: dict, report_path: Path, source_file: str, owner_email: str | None) -> None:
    report_id = str(report_json.get("document_hash", "")).strip()
    if not report_id:
        return
    profile = str(report_json.get("analysis_profile", "gdpr")).strip().lower() or "gdpr"
    score = int(report_json.get("executive_summary", {}).get("overall_risk_score", 0))
    severity = "low"
    if score >= 70:
        severity = "high"
    elif score >= 40:
        severity = "medium"

    upsert_document(
        document_hash=report_id,
        source_file=source_file,
        owner_email=owner_email,
    )
    upsert_report(
        report_id=report_id,
        document_hash=report_id,
        owner_email=owner_email,
        source_file=source_file,
        profile=profile,
        overall_score=score,
        severity=severity,
        report_path=str(report_path),
    )
