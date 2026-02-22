"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getReport, listReports } from "@/lib/api";
import { type NormalizedReport } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<NormalizedReport[]>([]);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const items = await listReports();
        const full = await Promise.all(items.map((item) => getReport(item.id)));
        setReports(full);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports.");
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let data = [...reports];

    if (query) {
      data = data.filter((r) => r.filename.toLowerCase().includes(query.toLowerCase()));
    }

    if (severity !== "all") {
      data = data.filter((r) => r.severity === severity);
    }

    if (sortBy === "score_desc") {
      data.sort((a, b) => b.overallScore - a.overallScore);
    } else if (sortBy === "score_asc") {
      data.sort((a, b) => a.overallScore - b.overallScore);
    } else if (sortBy === "date_asc") {
      data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return data;
  }, [query, reports, severity, sortBy]);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Search filename" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="all">All severities</option>
            <option value="low">Low risk</option>
            <option value="medium">Medium risk</option>
            <option value="high">High risk</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="score_desc">Score high to low</option>
            <option value="score_asc">Score low to high</option>
          </Select>
          <Link href="/upload">
            <Button className="w-full">Analyze New File</Button>
          </Link>
        </div>
      </Card>

      {error ? (
        <Card className="p-5 text-sm text-rose-700">{error}</Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Filename</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-text">{report.filename}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(report.timestamp)}</td>
                  <td className="px-5 py-3 text-slate-700">{report.overallScore}</td>
                  <td className="px-5 py-3">
                    <SeverityBadge severity={report.severity} />
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
        </Card>
      )}
    </div>
  );
}
