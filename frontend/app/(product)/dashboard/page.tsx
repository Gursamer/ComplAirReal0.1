"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { RiskDistributionChart } from "@/components/charts/risk-distribution-chart";
import { RiskTrendChart } from "@/components/charts/risk-trend-chart";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getReport, listReports } from "@/lib/api";
import { type NormalizedReport } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState<NormalizedReport[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await listReports();
        const full = await Promise.all(items.slice(0, 12).map((item) => getReport(item.id)));
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

  const highestRisk = useMemo(() => {
    if (!reports.length) return null;
    return [...reports].sort((a, b) => b.overallScore - a.overallScore)[0];
  }, [reports]);

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

  if (loading) {
    return <div className="text-sm text-slate-600">Loading dashboard...</div>;
  }

  if (error) {
    return <Card className="p-5 text-sm text-rose-700">{error}</Card>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-slate-500">Total reports analyzed</p>
          <p className="mt-2 text-3xl font-bold text-text">{reports.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500">Average risk score</p>
          <p className="mt-2 text-3xl font-bold text-text">{avgScore}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500">Highest risk document</p>
          <p className="mt-2 line-clamp-1 text-base font-semibold text-text">{highestRisk?.filename || "None"}</p>
          {highestRisk && <p className="mt-1 text-xs text-slate-500">Score {highestRisk.overallScore}</p>}
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-base font-semibold">Risk score trend</h2>
          <RiskTrendChart data={trend} />
        </Card>
        <Card className="p-5">
          <h2 className="text-base font-semibold">Risk distribution</h2>
          <RiskDistributionChart {...distribution} />
        </Card>
      </section>

      <section>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-semibold">Recent reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Filename</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 7).map((report) => (
                  <tr key={report.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-text">{report.filename}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(report.timestamp)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={report.severity} />
                        <span className="text-xs text-slate-600">{report.overallScore}</span>
                      </div>
                    </td>
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
    </div>
  );
}
