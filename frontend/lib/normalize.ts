import { type NormalizedClause, type NormalizedReport, type RawReport } from "@/lib/types";
import { severityFromScore } from "@/lib/utils";

function basename(path?: string): string {
  if (!path) return "Untitled document";
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

export function normalizeReport(raw: RawReport): NormalizedReport {
  const reportId = raw.report_id || raw.document_hash || cryptoSafeId();
  const filename = raw.filename || basename(raw.source_file);
  const clauseList = raw.clauses || [];
  const riskByClause = new Map((raw.risk_scores || []).map((r) => [r.clause_id || "", r]));
  const matchByClause = new Map<string, RawReport["gdpr_matches"]>();
  for (const m of raw.gdpr_matches || []) {
    const key = m.clause_id || "";
    const previous = matchByClause.get(key) || [];
    previous.push(m);
    matchByClause.set(key, previous);
  }
  const fixByClause = new Map((raw.suggested_fixes || []).map((f) => [f.clause_id || "", f]));

  const clauses: NormalizedClause[] = clauseList.map((clause, index) => {
    const id = clause.clause_id || `C${String(index + 1).padStart(3, "0")}`;
    const risk = riskByClause.get(id);
    const score = risk?.risk_score ?? 0;
    const matches = (matchByClause.get(id) || []).map((m) => ({
      article: m.article || "Unknown article",
      regulation: m.regulation || "GDPR",
      snippet: m.snippet || "",
      similarity: typeof m.similarity_score === "number" ? m.similarity_score : 0,
    }));
    const fix = fixByClause.get(id);

    return {
      id,
      title: clause.title || `Clause ${index + 1}`,
      category: clause.category || "Uncategorized",
      text: clause.text || "",
      riskScore: score,
      severity: risk?.severity || severityFromScore(score),
      issues: risk?.issues || [],
      matches,
      suggestedFix: fix
        ? {
            rationale: fix.rationale || "Suggested from matched regulation signals.",
            referencedArticles: fix.referenced_articles || [],
            text: fix.suggested_text || "",
          }
        : undefined,
    };
  });

  const calculatedOverall = raw.executive_summary?.overall_risk_score ??
    (clauses.length ? Math.round(clauses.reduce((sum, c) => sum + c.riskScore, 0) / clauses.length) : 0);
  const severity = raw.severity || severityFromScore(calculatedOverall);
  const highRiskCount = clauses.filter((c) => c.severity === "high").length;
  const missingRequirementsCount = clauses.reduce((sum, c) => sum + (c.issues?.length || 0), 0);

  const citationFrequency = new Map<string, number>();
  clauses.forEach((c) => {
    c.matches.forEach((m) => citationFrequency.set(m.article, (citationFrequency.get(m.article) || 0) + 1));
  });
  const topRegulation =
    [...citationFrequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "Article 32";

  return {
    id: reportId,
    filename,
    timestamp: raw.timestamp || new Date().toISOString(),
    overallScore: raw.overall_score ?? calculatedOverall,
    severity,
    highRiskCount,
    missingRequirementsCount,
    topRegulation,
    estimatedTimeSavedHours: Math.max(2, Math.round(clauses.length * 0.6)),
    keyFindings:
      raw.executive_summary?.key_findings ||
      topFindingsFromClauses(clauses),
    clauses,
  };
}

function topFindingsFromClauses(clauses: NormalizedClause[]): string[] {
  const findings = clauses
    .flatMap((c) => c.issues.map((i) => `${c.title}: ${i}`))
    .slice(0, 5);
  if (findings.length) return findings;
  return ["No significant GDPR risks detected by the current policy rule set."];
}

function cryptoSafeId(): string {
  return `demo-${Math.random().toString(36).slice(2, 10)}`;
}
