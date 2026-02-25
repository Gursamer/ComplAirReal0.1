from __future__ import annotations

import json
from pathlib import Path

from app.config import settings
from app.pipeline.regulations import keyword_match, resolve_profile
from app.schemas import Clause, GDPRMatch
from app.utils.embeddings import embed_texts


COLLECTION = "gdpr_chunks"
FALLBACK_INDEX = "gdpr_index.json"

SOC2_CONTROLS: list[tuple[str, str, str, tuple[str, ...]]] = [
    (
        "SOC2 CC6.1",
        "Access Controls",
        "Logical and physical access controls should be restricted to authorized users.",
        ("access control", "least privilege", "mfa", "authentication", "authorized"),
    ),
    (
        "SOC2 CC7.2",
        "Monitoring",
        "System monitoring should detect and act on anomalies in a timely way.",
        ("monitoring", "logging", "alert", "incident", "anomaly"),
    ),
    (
        "SOC2 CC8.1",
        "Change Management",
        "Changes should be authorized, tested, and documented before deployment.",
        ("change management", "deployment", "testing", "approval", "rollback"),
    ),
]

PCI_CONTROLS: list[tuple[str, str, str, tuple[str, ...]]] = [
    (
        "PCI DSS 3.4",
        "PAN Protection",
        "Primary account numbers must be rendered unreadable when stored.",
        ("cardholder", "pan", "tokenization", "encryption", "truncate"),
    ),
    (
        "PCI DSS 8.3",
        "Strong Authentication",
        "Multi-factor authentication is required for administrative and remote access.",
        ("mfa", "multi-factor", "admin access", "remote access", "authentication"),
    ),
    (
        "PCI DSS 10.2",
        "Audit Logs",
        "Audit logs must capture user activities and system events.",
        ("audit log", "logging", "access log", "event log", "traceability"),
    ),
]


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(y * y for y in b) ** 0.5
    if na == 0 or nb == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (na * nb)))


def _fallback_match(clauses: list[Clause], top_k: int) -> list[GDPRMatch]:
    path = Path(settings.chroma_path) / FALLBACK_INDEX
    if not path.exists():
        raise FileNotFoundError(
            f"RAG index not found at {path}. Run `python -m app.rag.build_index` first."
        )
    rows = json.loads(path.read_text(encoding="utf-8"))
    clause_embeddings = embed_texts([c.text for c in clauses])
    results: list[GDPRMatch] = []

    for clause, emb in zip(clauses, clause_embeddings):
        ranked = sorted(
            rows,
            key=lambda r: _cosine_similarity(emb, r.get("embedding", [])),
            reverse=True,
        )[:top_k]

        for row in ranked:
            meta = row.get("metadata", {})
            sim = _cosine_similarity(emb, row.get("embedding", []))
            results.append(
                GDPRMatch(
                    clause_id=clause.clause_id,
                    article=str(meta.get("article", "Unknown")),
                    topic=str(meta.get("topic", "unknown")),
                    snippet=str(row.get("document", ""))[:280],
                    similarity_score=round(sim, 4),
                    regulation="GDPR",
                )
            )

    return results


def match_clauses_to_gdpr(clauses: list[Clause], top_k: int | None = None) -> list[GDPRMatch]:
    top_k = top_k or settings.clause_top_k
    try:
        import chromadb

        client = chromadb.PersistentClient(path=str(settings.chroma_path))
        collection = client.get_collection(COLLECTION)

        clause_texts = [c.text for c in clauses]
        clause_embeddings = embed_texts(clause_texts)

        results: list[GDPRMatch] = []
        query = collection.query(
            query_embeddings=clause_embeddings,
            n_results=top_k,
            include=["metadatas", "documents", "distances"],
        )

        for idx, clause in enumerate(clauses):
            docs = query.get("documents", [[]])[idx]
            metas = query.get("metadatas", [[]])[idx]
            distances = query.get("distances", [[]])[idx]

            for doc, meta, dist in zip(docs, metas, distances):
                similarity = max(0.0, min(1.0, 1.0 - float(dist)))
                results.append(
                    GDPRMatch(
                        clause_id=clause.clause_id,
                        article=str(meta.get("article", "Unknown")),
                        topic=str(meta.get("topic", "unknown")),
                        snippet=doc[:280],
                        similarity_score=round(similarity, 4),
                        regulation="GDPR",
                    )
                )

        return results
    except Exception:
        return _fallback_match(clauses, top_k)


def match_clauses_by_profile(clauses: list[Clause], profile: str, top_k: int | None = None) -> list[GDPRMatch]:
    resolved = resolve_profile(profile)
    matches: list[GDPRMatch] = []

    if "GDPR" in resolved.regulations:
        matches.extend(match_clauses_to_gdpr(clauses, top_k=top_k))
    if "SOC2" in resolved.regulations:
        matches.extend(keyword_match(clauses, "SOC2", SOC2_CONTROLS, top_k=top_k or settings.clause_top_k))
    if "PCI" in resolved.regulations:
        matches.extend(keyword_match(clauses, "PCI", PCI_CONTROLS, top_k=top_k or settings.clause_top_k))

    return matches
