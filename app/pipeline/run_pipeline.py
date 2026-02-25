from __future__ import annotations

import argparse

from app.config import settings
from app.pipeline.extract_clauses import extract_clauses
from app.pipeline.rag_match import match_clauses_by_profile
from app.pipeline.regulations import resolve_profile
from app.pipeline.report import create_report, save_report
from app.pipeline.risk_score import score_risks
from app.pipeline.suggest_fixes import suggest_fixes
from app.utils.hashing import sha256_text
from app.utils.pdf_text import extract_pdf_text


def run(file_path: str, profile: str = "gdpr") -> str:
    raw_text = extract_pdf_text(file_path)
    doc_hash = sha256_text(raw_text)[:16]
    resolved_profile = resolve_profile(profile)

    clauses = extract_clauses(raw_text)
    matches = match_clauses_by_profile(clauses, profile=resolved_profile.key)
    risks = score_risks(clauses, matches, profile=resolved_profile.key)
    fixes = suggest_fixes(clauses, matches, risks)

    report = create_report(
        source_file=file_path,
        document_hash=doc_hash,
        analysis_profile=resolved_profile.key,
        regulations=resolved_profile.regulations,
        clauses=clauses,
        matches=matches,
        risks=risks,
        fixes=fixes,
    )
    path = save_report(report, settings.report_path)
    return str(path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ComplyAI Week 1 pipeline")
    parser.add_argument("--file", required=True, help="Path to PDF file")
    parser.add_argument("--profile", default="gdpr", help="Analysis profile: gdpr|soc2|pci|multi")
    args = parser.parse_args()

    output_path = run(args.file, profile=args.profile)
    print(f"Report generated: {output_path}")


if __name__ == "__main__":
    main()
