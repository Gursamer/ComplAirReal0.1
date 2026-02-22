import { Card } from "@/components/ui/card";
import { type NormalizedClause } from "@/lib/types";

export function Citations({ clauses }: { clauses: NormalizedClause[] }) {
  const rows = clauses.flatMap((clause) =>
    clause.matches.slice(0, 2).map((m) => ({
      clause: clause.title,
      article: m.article,
      snippet: m.snippet,
      similarity: m.similarity,
    })),
  );

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-text">Citations</h3>
      <div className="mt-4 space-y-3">
        {rows.slice(0, 10).map((row, index) => (
          <div key={`${row.article}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text">{row.article}</p>
              <p className="text-xs text-slate-500">Similarity: {row.similarity.toFixed(2)}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Linked clause: {row.clause}</p>
            <p className="mt-2 text-sm text-slate-700">{row.snippet || "No snippet available"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
