"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { SeverityBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { type NormalizedClause } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FlaggedClauses({ clauses }: { clauses: NormalizedClause[] }) {
  const risky = clauses.filter((c) => c.riskScore >= 40);
  const [openId, setOpenId] = useState<string | null>(risky[0]?.id || null);

  if (!risky.length) {
    return (
      <Card className="p-5">
        <h3 className="text-base font-semibold text-slate-900">Flagged Clauses</h3>
        <p className="mt-3 text-sm text-slate-500">No medium/high risk clauses in this report.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-slate-900">Flagged Clauses</h3>
      <div className="mt-4 space-y-3">
        {risky.map((clause) => {
          const open = openId === clause.id;
          return (
            <div key={clause.id} className="rounded-xl border border-slate-200 bg-slate-50">
              <button
                onClick={() => setOpenId(open ? null : clause.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{clause.title}</p>
                  <p className="text-xs text-slate-500">{clause.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={clause.severity} />
                  <ChevronDown className={cn("transition", open && "rotate-180")} size={16} />
                </div>
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  open ? "grid-rows-[1fr] border-t border-slate-200" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 p-4 text-sm text-slate-700">
                    <p className="rounded-lg bg-white p-3">{clause.text || "No clause text available."}</p>
                    <div>
                      <p className="font-semibold">Risk reasons</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {clause.issues.map((issue, idx) => (
                          <li key={`${clause.id}-${idx}`}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Citations</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {clause.matches.slice(0, 3).map((match, idx) => (
                          <span key={`${clause.id}-m-${idx}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-900">
                            {match.article}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
