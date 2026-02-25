from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.storage.db import get_report_meta, list_reports as list_reports_db
from app.utils.auth import AuthUser, get_optional_current_user
router = APIRouter(tags=["reports"])


def _report_path(report_id: str) -> Path:
    return settings.report_path / f"{report_id}.json"


@router.get("/reports/{report_id}")
def get_report(report_id: str, current_user: AuthUser | None = Depends(get_optional_current_user)) -> dict:
    meta = get_report_meta(report_id)
    if meta and meta.get("owner_email") and current_user and meta.get("owner_email") != current_user.email:
        raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
    path = Path(str(meta.get("report_path"))) if meta and meta.get("report_path") else _report_path(report_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")
    return json.loads(path.read_text(encoding="utf-8"))


@router.get("/reports")
def list_reports(current_user: AuthUser | None = Depends(get_optional_current_user)) -> dict:
    owner = current_user.email if current_user else None
    db_rows = list_reports_db(owner_email=owner)
    if db_rows:
        items = [
            {
                "id": row["report_id"],
                "source_file": row.get("source_file", ""),
                "profile": row.get("profile", "gdpr"),
                "path": row.get("report_path", ""),
                "timestamp": row.get("created_at", ""),
                "score": int(row.get("overall_score", 0)),
                "severity": row.get("severity", "low"),
            }
            for row in db_rows
        ]
        return {"count": len(items), "reports": items}

    reports_dir = settings.report_path
    reports_dir.mkdir(parents=True, exist_ok=True)

    items = []
    for path in sorted(reports_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        report_id = path.stem
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            source_file = payload.get("source_file", "")
            score = int(payload.get("executive_summary", {}).get("overall_risk_score", 0))
            profile = str(payload.get("analysis_profile", "gdpr"))
            severity = "low"
            if score >= 70:
                severity = "high"
            elif score >= 40:
                severity = "medium"
        except Exception:
            source_file = ""
            profile = "gdpr"
            score = 0
            severity = "low"

        items.append(
            {
                "id": report_id,
                "source_file": source_file,
                "profile": profile,
                "path": str(path),
                "timestamp": path.stat().st_mtime,
                "score": score,
                "severity": severity,
            }
        )

    return {"count": len(items), "reports": items}


@router.get("/reports/{report_id}/export.pdf")
def export_report_pdf(report_id: str, current_user: AuthUser | None = Depends(get_optional_current_user)):
    report = get_report(report_id, current_user=current_user)
    pdf_data = _render_report_pdf(report)
    filename = f"{report_id}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(BytesIO(pdf_data), media_type="application/pdf", headers=headers)


def _render_report_pdf(report: dict) -> bytes:
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF export dependency missing: {exc}") from exc

    output = BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter
    y = height - 48

    def line(text: str, bold: bool = False, step: int = 16) -> None:
        nonlocal y
        c.setFont("Helvetica-Bold" if bold else "Helvetica", 11)
        c.drawString(48, y, text[:110])
        y -= step
        if y < 48:
            c.showPage()
            y = height - 48

    summary = report.get("executive_summary", {})
    line("ComplyAI Compliance Report", bold=True, step=20)
    line(f"Source file: {report.get('source_file', 'Unknown')}")
    line(f"Profile: {report.get('analysis_profile', 'gdpr')}")
    regs = report.get("regulations", ["GDPR"])
    line(f"Regulations: {', '.join(regs)}")
    line(f"Overall risk score: {summary.get('overall_risk_score', 0)}")
    line(f"High-risk clauses: {summary.get('high_risk_clauses', 0)}")
    y -= 6
    line("Top findings:", bold=True)
    findings = summary.get("key_findings", []) or []
    if not findings:
        line("- No significant findings.")
    for item in findings[:8]:
        line(f"- {str(item)}")
    y -= 6
    line("Clause risk details:", bold=True)
    risk_rows = {str(r.get("clause_id", "")): r for r in report.get("risk_scores", [])}
    for clause in report.get("clauses", [])[:25]:
        cid = str(clause.get("clause_id", ""))
        risk = risk_rows.get(cid, {})
        line(f"{cid} | {clause.get('title', 'Clause')} | score {risk.get('risk_score', 0)}")

    c.save()
    return output.getvalue()
