"use client";

import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { type NormalizedClause } from "@/lib/types";

export function TopRisksSummary({ clauses }: { clauses: NormalizedClause[] }) {
  const top = [...clauses]
    .filter((c) => c.riskScore >= 40)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3);

  if (!top.length) {
    return (
      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">Top 3 Risks</h3>
        <p className="mt-3 text-sm text-slate-500">No medium/high risk findings in this report.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900">Top 3 Risks</h3>
      <div className="mt-4 space-y-3">
        {top.map((clause) => (
          <div key={clause.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{clause.id} - {clause.title}</p>
                <p className="mt-1 text-xs text-slate-500">Score: {clause.riskScore}</p>
              </div>
              <SeverityBadge severity={clause.severity} />
            </div>
            <p className="mt-2 text-sm text-slate-700">{clause.issues[0] || "High risk detected by current rule set."}</p>
            {clause.suggestedFix?.text ? (
              <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
                Suggested fix: {clause.suggestedFix.text.slice(0, 220)}
                {clause.suggestedFix.text.length > 220 ? "..." : ""}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {clause.matches.slice(0, 3).map((m, idx) => (
                <span key={`${clause.id}-${idx}`} className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                  {m.article}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
