from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from app.config import settings


def _connect() -> sqlite3.Connection:
    db_path = settings.sqlite_db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_hash TEXT NOT NULL UNIQUE,
                source_file TEXT NOT NULL,
                owner_email TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(owner_email) REFERENCES users(email) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT NOT NULL UNIQUE,
                document_hash TEXT NOT NULL,
                owner_email TEXT,
                source_file TEXT NOT NULL,
                profile TEXT NOT NULL DEFAULT 'gdpr',
                overall_score INTEGER NOT NULL DEFAULT 0,
                severity TEXT NOT NULL DEFAULT 'low',
                report_path TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(document_hash) REFERENCES documents(document_hash) ON DELETE CASCADE,
                FOREIGN KEY(owner_email) REFERENCES users(email) ON DELETE SET NULL
            );

            CREATE INDEX IF NOT EXISTS idx_reports_owner_created
            ON reports(owner_email, created_at DESC);
            """
        )


def upsert_user(email: str, password_hash: str) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO users(email, password_hash)
            VALUES(?, ?)
            ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash
            """,
            (email, password_hash),
        )


def get_user(email: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT email, password_hash, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    if not row:
        return None
    return dict(row)


def upsert_document(document_hash: str, source_file: str, owner_email: str | None) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO documents(document_hash, source_file, owner_email)
            VALUES(?, ?, ?)
            ON CONFLICT(document_hash) DO UPDATE SET
              source_file = excluded.source_file,
              owner_email = COALESCE(excluded.owner_email, documents.owner_email)
            """,
            (document_hash, source_file, owner_email),
        )


def upsert_report(
    *,
    report_id: str,
    document_hash: str,
    owner_email: str | None,
    source_file: str,
    profile: str,
    overall_score: int,
    severity: str,
    report_path: str,
) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO reports(
              report_id, document_hash, owner_email, source_file, profile, overall_score, severity, report_path
            )
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(report_id) DO UPDATE SET
              owner_email = COALESCE(excluded.owner_email, reports.owner_email),
              source_file = excluded.source_file,
              profile = excluded.profile,
              overall_score = excluded.overall_score,
              severity = excluded.severity,
              report_path = excluded.report_path
            """,
            (report_id, document_hash, owner_email, source_file, profile, overall_score, severity, report_path),
        )


def list_reports(owner_email: str | None = None) -> list[dict[str, Any]]:
    query = """
        SELECT report_id, source_file, profile, overall_score, severity, report_path, created_at
        FROM reports
    """
    args: tuple[Any, ...] = ()
    if owner_email:
        query += " WHERE owner_email = ?"
        args = (owner_email,)
    query += " ORDER BY datetime(created_at) DESC"

    with _connect() as conn:
        rows = conn.execute(query, args).fetchall()
    return [dict(r) for r in rows]


def get_report_meta(report_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT report_id, source_file, profile, overall_score, severity, report_path, owner_email, created_at
            FROM reports
            WHERE report_id = ?
            """,
            (report_id,),
        ).fetchone()
    if not row:
        return None
    return dict(row)
