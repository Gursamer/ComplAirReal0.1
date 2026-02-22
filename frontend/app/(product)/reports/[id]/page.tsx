"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CategoryDonut } from "@/components/charts/category-donut";
import { ClauseRiskBar } from "@/components/charts/clause-risk-bar";
import { Citations } from "@/components/sections/citations";
import { FlaggedClauses } from "@/components/sections/flagged-clauses";
import { KeyFindings } from "@/components/sections/key-findings";
import { SuggestedFixes } from "@/components/sections/suggested-fixes";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { getReport } from "@/lib/api";
import { type NormalizedReport } from "@/lib/types";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<NormalizedReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!params.id) return;
        const data = await getReport(params.id);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report.");
      }
    })();
  }, [params.id]);

  const categoryBreakdown = useMemo(() => {
    if (!report) return [];
    const map = new Map<string, number>();
    report.clauses.forEach((c) => {
      map.set(c.category, (map.get(c.category) || 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [report]);

  const topRisks = useMemo(() => {
    if (!report) return [];
    return [...report.clauses]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)
      .map((c) => ({ name: c.id, score: c.riskScore }));
  }, [report]);

  if (error) return <Card className="p-5 text-sm text-rose-700">{error}</Card>;
  if (!report) return <div className="text-sm text-slate-600">Loading report...</div>;

  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[auto,1fr,auto] md:items-center"
      >
        <ScoreRing score={report.overallScore} />
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Overall compliance score</p>
          <h2 className="mt-1 text-2xl font-bold text-text">{report.filename}</h2>
          <div className="mt-2">
            <SeverityBadge severity={report.severity} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={download} className="gap-2">
            <Download size={14} /> Download JSON
          </Button>
          <Button variant="ghost" disabled>
            Export PDF (soon)
          </Button>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-slate-500">High-risk clauses</p>
          <p className="mt-2 text-2xl font-bold">{report.highRiskCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Missing requirements</p>
          <p className="mt-2 text-2xl font-bold">{report.missingRequirementsCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Top regulation cited</p>
          <p className="mt-2 text-2xl font-bold">{report.topRegulation}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500">Estimated time saved</p>
          <p className="mt-2 text-2xl font-bold">{report.estimatedTimeSavedHours}h</p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-semibold">Category risk breakdown</h3>
          <CategoryDonut data={categoryBreakdown} />
        </Card>
        <Card className="p-5">
          <h3 className="text-base font-semibold">Top 10 risky clauses</h3>
          <ClauseRiskBar data={topRisks} />
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <KeyFindings items={report.keyFindings} />
        <Citations clauses={report.clauses} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <FlaggedClauses clauses={report.clauses} />
        <SuggestedFixes clauses={report.clauses} />
      </section>
    </div>
  );
}
