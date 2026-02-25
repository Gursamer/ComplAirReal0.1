"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type NormalizedClause } from "@/lib/types";

export function SuggestedFixes({ clauses }: { clauses: NormalizedClause[] }) {
  const withFixes = clauses.filter((c) => c.suggestedFix?.text);
  const [copiedId, setCopiedId] = useState<string>("");
  const [highlight, setHighlight] = useState(true);

  const emphasize = (text: string) => {
    if (!highlight) return text;
    const keywords = ["encryption", "72 hours", "controller", "processor", "audit", "breach", "lawful basis"];
    let out = text;
    for (const word of keywords) {
      const re = new RegExp(`(${word})`, "ig");
      out = out.replace(re, "<mark>$1</mark>");
    }
    return out;
  };

  if (!withFixes.length) {
    return (
      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">Suggested Fixes</h3>
        <p className="mt-3 text-sm text-slate-500">No rewrite suggestions were generated.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900">Suggested Fixes</h3>
      <div className="mt-2">
        <button
          className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          onClick={() => setHighlight((v) => !v)}
        >
          {highlight ? "Hide highlighted changes" : "Highlight key changes"}
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {withFixes.slice(0, 6).map((clause) => (
          <div key={clause.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
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
            <p
              className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-700 [&_mark]:rounded [&_mark]:bg-amber-100 [&_mark]:px-1 [&_mark]:text-amber-800"
              dangerouslySetInnerHTML={{ __html: emphasize(clause.suggestedFix?.text || "") }}
            />
            {!!clause.suggestedFix?.referencedArticles.length && (
              <p className="mt-2 text-xs text-slate-500">
                Cites: {clause.suggestedFix.referencedArticles.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
