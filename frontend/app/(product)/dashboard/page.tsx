"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { RiskTrendChart } from "@/components/charts/risk-trend-chart";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getReport, listReports } from "@/lib/api";
import { type NormalizedReport } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<NormalizedReport[]>([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const items = await listReports();
      const full = await Promise.all(items.slice(0, 18).map((item) => getReport(item.id)));
      setReports(full);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await listReports();
        const full = await Promise.all(items.slice(0, 18).map((item) => getReport(item.id)));
        if (!mounted) return;
        setReports(full);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const avgScore = useMemo(() => {
    if (!reports.length) return 0;
    return Math.round(reports.reduce((sum, r) => sum + r.overallScore, 0) / reports.length);
  }, [reports]);

  const highRiskCount = reports.filter((r) => r.severity === "high").length;

  const distribution = useMemo(() => {
    const low = reports.filter((r) => r.severity === "low").length;
    const medium = reports.filter((r) => r.severity === "medium").length;
    const high = reports.filter((r) => r.severity === "high").length;
    return { low, medium, high };
  }, [reports]);

  const trend = useMemo(
    () =>
      [...reports]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((r) => ({ date: new Date(r.timestamp).toLocaleDateString(), score: r.overallScore })),
    [reports],
  );

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const report of reports) {
      for (const clause of report.clauses) {
        counts.set(clause.category, (counts.get(clause.category) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [reports]);

  if (loading) {
    return <div className="text-sm text-slate-600">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <Card className="space-y-3 p-5">
        <p className="text-sm font-semibold text-rose-700">Dashboard unavailable</p>
        <p className="text-sm text-slate-700">{error}</p>
        <div className="flex gap-2">
          <Button onClick={load}>Retry</Button>
          <Link href="/settings">
            <Button variant="secondary">Open Settings</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total documents analyzed</p>
          <AnimatedNumber value={reports.length} className="mt-2 text-3xl font-bold text-slate-900" />
        </Card>
        <Card className="group border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Average risk score</p>
          <AnimatedNumber value={avgScore} className="mt-2 text-3xl font-bold text-slate-900" />
        </Card>
        <Card className="group border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">High-risk docs</p>
          <AnimatedNumber value={highRiskCount} className="mt-2 text-3xl font-bold text-slate-900" />
        </Card>
        <Card className="group border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Compliance trend</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{trend.at(-1)?.score || 0}%</p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">Compliance score over time</h2>
          <RiskTrendChart data={trend} />
        </Card>
        <Card className="border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">Risk distribution</h2>
          <RiskDistributionChart {...distribution} />
        </Card>
      </section>

      <section>
        <Card className="border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">Clause category breakdown</h2>
          <CategoryBarChart data={categoryBreakdown} />
        </Card>
      </section>

      <section>
        <Card className="overflow-hidden border border-slate-200">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-semibold text-slate-900">Recent Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">File name</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Severity</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Open</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 8).map((report) => (
                  <tr key={report.id} className="border-t border-slate-200">
                    <td className="px-5 py-3 font-medium text-slate-900">{report.filename}</td>
                    <td className="px-5 py-3 text-slate-700">{report.overallScore}</td>
                    <td className="px-5 py-3">
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(report.timestamp)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/reports/${report.id}`}>
                        <Button variant="secondary">Open</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </motion.div>
  );
}
