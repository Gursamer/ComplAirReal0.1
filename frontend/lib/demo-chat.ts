import { type NormalizedClause, type NormalizedReport } from "@/lib/types";

export interface DemoChatReply {
  text: string;
  bullets?: string[];
  citations?: string[];
}

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "for",
  "on",
  "is",
  "are",
  "be",
  "with",
  "about",
  "what",
  "which",
  "how",
  "why",
  "this",
  "that",
  "can",
  "you",
  "show",
  "tell",
  "me",
]);

export function demoChatResponder(report: NormalizedReport, question: string): DemoChatReply {
  const query = question.toLowerCase().trim();

  if (isTopRiskQuery(query)) return topRiskReply(report);
  if (isRewriteQuery(query)) return rewriteReply(report, question);
  if (isCitationQuery(query)) return citationReply(report);
  if (isMissingQuery(query)) return missingReply(report);
  if (isScoreQuery(query)) return scoreBreakdownReply(report);

  return localIntelligenceReply(report, query);
}

function isTopRiskQuery(query: string): boolean {
  return /top.*risk|highest.*risk|major.*risk|critical.*risk/.test(query);
}

function isRewriteQuery(query: string): boolean {
  return /rewrite|reword|improve.*clause/.test(query);
}

function isCitationQuery(query: string): boolean {
  return /gdpr|article|citation|regulation|relevant/.test(query);
}

function isMissingQuery(query: string): boolean {
  return /missing|gap|not covered|requirements?/.test(query);
}

function isScoreQuery(query: string): boolean {
  return /explain.*score|why.*score|score breakdown|how.*scored/.test(query);
}

function topRiskReply(report: NormalizedReport): DemoChatReply {
  const top = [...report.clauses].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
  if (!top.length) {
    return { text: "No clauses are currently available to score in this report." };
  }

  const bullets = top.map((c) => {
    const why = c.issues[0] || "High-risk language detected.";
    return `${c.id} (${c.riskScore}): ${why}`;
  });
  const citations = unique(top.flatMap((c) => c.matches.map((m) => m.article))).slice(0, 4);
  return {
    text: "Top risk clauses are shown below based on your current compliance profile.",
    bullets,
    citations,
  };
}

function rewriteReply(report: NormalizedReport, rawQuestion: string): DemoChatReply {
  const requested = parseClauseId(rawQuestion);
  const target = requested ? byClauseId(report, requested) : highestRiskWithFix(report);
  if (!target || !target.suggestedFix) {
    return {
      text: "I could not find a suggested rewrite for that clause yet.",
      bullets: ["Try: Rewrite clause 5", "Or ask: Top 3 risks"],
    };
  }

  return {
    text: `Suggested rewrite for ${target.id}:`,
    bullets: [
      target.suggestedFix.text,
      "Why this helps: It tightens obligations and aligns language with cited controls.",
    ],
    citations: unique(target.matches.map((m) => m.article)).slice(0, 3),
  };
}

function citationReply(report: NormalizedReport): DemoChatReply {
  const map = new Map<string, number>();
  for (const clause of report.clauses) {
    for (const match of clause.matches) {
      map.set(match.article, (map.get(match.article) || 0) + 1);
    }
  }
  const ranked = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!ranked.length) {
    return { text: "No citations are available yet for this report." };
  }

  return {
    text: "Most relevant citations for this report:",
    bullets: ranked.map(([article, count]) => `${article} (referenced in ${count} clauses)`),
    citations: ranked.map(([article]) => article),
  };
}

function missingReply(report: NormalizedReport): DemoChatReply {
  const issueCounts = new Map<string, number>();
  for (const clause of report.clauses) {
    for (const issue of clause.issues) {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
    }
  }
  const top = [...issueCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return {
    text: "Common missing or weakly covered requirements:",
    bullets: top.length
      ? top.map(([issue, count]) => `${issue} (${count} mentions)`)
      : ["No major missing requirements detected by the current rule set."],
  };
}

function scoreBreakdownReply(report: NormalizedReport): DemoChatReply {
  const byCategory = new Map<string, { total: number; count: number }>();
  for (const clause of report.clauses) {
    const row = byCategory.get(clause.category) || { total: 0, count: 0 };
    row.total += clause.riskScore;
    row.count += 1;
    byCategory.set(clause.category, row);
  }
  const bullets = [...byCategory.entries()]
    .map(([category, row]) => `${category}: ${Math.round(row.total / row.count)} avg risk (${row.count} clauses)`)
    .sort((a, b) => Number(b.split(": ")[1].split(" ")[0]) - Number(a.split(": ")[1].split(" ")[0]))
    .slice(0, 6);

  return {
    text: `Overall score is ${report.overallScore}. Here is the category-level breakdown:`,
    bullets,
  };
}

function localIntelligenceReply(report: NormalizedReport, query: string): DemoChatReply {
  const terms = query
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  if (!terms.length) {
    return {
      text: "Ask about risks, rewrites, missing controls, score explanation, or citations.",
      bullets: [
        "What are the top 3 risks?",
        "Rewrite clause 5 in stronger terms",
        "Which GDPR articles are most relevant?",
      ],
    };
  }

  const ranked = report.clauses
    .map((clause) => ({ clause, score: relevanceScore(clause, terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (!ranked.length) {
    return {
      text: "I did not find a strong direct match in this report.",
      bullets: ["Try referencing a topic like breach, encryption, retention, or access control."],
    };
  }

  const best = ranked[0].clause;
  return {
    text: `Best match: ${best.id} - ${best.title}`,
    bullets: [best.issues[0] || "Risk signal detected.", `Current score: ${best.riskScore}`],
    citations: unique(best.matches.map((m) => m.article)).slice(0, 3),
  };
}

function relevanceScore(clause: NormalizedClause, terms: string[]): number {
  const haystack = `${clause.title} ${clause.text} ${clause.issues.join(" ")}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += 2;
  }
  score += Math.round(clause.riskScore / 20);
  return score;
}

function parseClauseId(input: string): string | null {
  const lowered = input.toLowerCase();
  const cMatch = lowered.match(/\bc(\d{1,3})\b/);
  if (cMatch) return `C${cMatch[1].padStart(3, "0")}`;
  const numeric = lowered.match(/clause\s+(\d{1,3})/);
  if (numeric) return `C${numeric[1].padStart(3, "0")}`;
  return null;
}

function byClauseId(report: NormalizedReport, id: string): NormalizedClause | undefined {
  return report.clauses.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

function highestRiskWithFix(report: NormalizedReport): NormalizedClause | undefined {
  return [...report.clauses]
    .filter((c) => c.suggestedFix?.text)
    .sort((a, b) => b.riskScore - a.riskScore)[0];
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}
