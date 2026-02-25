"use client";

import { Card } from "@/components/ui/card";
import { type NormalizedClause } from "@/lib/types";

function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function emphasizeDifferences(original: string, suggested: string): string {
  const originalSet = new Set(tokenize(original.toLowerCase()));
  const parts = tokenize(suggested);
  return parts
    .map((token) => {
      const clean = token.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean && !originalSet.has(clean)) {
        return `<mark>${token}</mark>`;
      }
      return token;
    })
    .join(" ");
}

export function ClauseDiffPreview({ clauses }: { clauses: NormalizedClause[] }) {
  const target = [...clauses]
    .filter((c) => c.suggestedFix?.text)
    .sort((a, b) => b.riskScore - a.riskScore)[0];

  if (!target || !target.suggestedFix) {
    return (
      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">Suggested Fix Diff</h3>
        <p className="mt-3 text-sm text-slate-500">No suggested clause rewrite available for diff preview.</p>
      </Card>
    );
  }

  const improved = emphasizeDifferences(target.text, target.suggestedFix.text);

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900">Suggested Fix Diff ({target.id})</h3>
      <p className="mt-1 text-xs text-slate-500">New or strengthened words are highlighted.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Original clause</p>
          <p className="mt-2 text-sm text-slate-700">{target.text}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Suggested clause</p>
          <p
            className="mt-2 text-sm text-emerald-900 [&_mark]:rounded [&_mark]:bg-amber-100 [&_mark]:px-1 [&_mark]:text-amber-900"
            dangerouslySetInnerHTML={{ __html: improved }}
          />
        </div>
      </div>
    </Card>
  );
}
