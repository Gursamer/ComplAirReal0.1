from __future__ import annotations

from dataclasses import dataclass

from app.schemas import Clause, GDPRMatch


@dataclass(frozen=True)
class RegulationProfile:
    key: str
    label: str
    regulations: list[str]


_PROFILE_MAP: dict[str, RegulationProfile] = {
    "gdpr": RegulationProfile(key="gdpr", label="GDPR-focused", regulations=["GDPR"]),
    "soc2": RegulationProfile(key="soc2", label="SOC 2-focused", regulations=["SOC2"]),
    "pci": RegulationProfile(key="pci", label="PCI DSS-focused", regulations=["PCI"]),
    "multi": RegulationProfile(key="multi", label="Multi-regulation", regulations=["GDPR", "SOC2", "PCI"]),
    # Backward-compatible aliases from the current UI.
    "vendor": RegulationProfile(key="gdpr", label="GDPR-focused", regulations=["GDPR"]),
    "privacy": RegulationProfile(key="gdpr", label="GDPR-focused", regulations=["GDPR"]),
}


def resolve_profile(profile: str | None) -> RegulationProfile:
    key = (profile or "gdpr").strip().lower()
    return _PROFILE_MAP.get(key, _PROFILE_MAP["gdpr"])


def keyword_match(
    clauses: list[Clause],
    regulation: str,
    controls: list[tuple[str, str, str, tuple[str, ...]]],
    top_k: int = 3,
) -> list[GDPRMatch]:
    results: list[GDPRMatch] = []
    for clause in clauses:
        text = clause.text.lower()
        hits: list[tuple[str, str, str, int]] = []
        for control_id, topic, snippet, keywords in controls:
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                hits.append((control_id, topic, snippet, score))

        hits.sort(key=lambda item: item[3], reverse=True)
        for control_id, topic, snippet, score in hits[:top_k]:
            sim = min(0.99, 0.45 + (score * 0.12))
            results.append(
                GDPRMatch(
                    clause_id=clause.clause_id,
                    article=control_id,
                    topic=topic,
                    snippet=snippet,
                    similarity_score=round(sim, 4),
                    regulation=regulation,
                )
            )
    return results
