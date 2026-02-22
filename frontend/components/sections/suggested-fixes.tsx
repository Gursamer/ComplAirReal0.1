"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type NormalizedClause } from "@/lib/types";

export function SuggestedFixes({ clauses }: { clauses: NormalizedClause[] }) {
  const withFixes = clauses.filter((c) => c.suggestedFix?.text);
  const [copiedId, setCopiedId] = useState<string>("");

  if (!withFixes.length) {
    return (
      <Card className="p-5">
        <h3 className="text-base font-semibold text-text">Suggested Fixes</h3>
        <p className="mt-3 text-sm text-slate-600">No rewrite suggestions were generated.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-text">Suggested Fixes</h3>
      <div className="mt-4 space-y-3">
        {withFixes.slice(0, 6).map((clause) => (
          <div key={clause.id} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text">{clause.title}</p>
              <Button
                variant="secondary"
                onClick={async () => {
                  const text = clause.suggestedFix?.text || "";
                  await navigator.clipboard.writeText(text);
                  setCopiedId(clause.id);
                  setTimeout(() => setCopiedId(""), 1200);
                }}
              >
                {copiedId === clause.id ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">{clause.suggestedFix?.rationale}</p>
            <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{clause.suggestedFix?.text}</p>
            {!!clause.suggestedFix?.referencedArticles.length && (
              <p className="mt-2 text-xs text-slate-600">
                Cites: {clause.suggestedFix.referencedArticles.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
