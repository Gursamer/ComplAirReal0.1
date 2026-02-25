"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: Array<{ date: string; score: number }>;
}

export function RiskTrendChart({ data }: Props) {
  const latest = data.at(-1)?.score ?? 0;
  const first = data[0]?.score ?? latest;
  const delta = latest - first;
  const average = data.length ? Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length) : 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="font-medium text-slate-500">Latest score</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{latest}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="font-medium text-slate-500">Average score</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{average}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="font-medium text-slate-500">Period change</p>
          <p className={`mt-1 text-lg font-semibold ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {delta >= 0 ? "+" : ""}
            {delta}
          </p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
            <ReferenceLine y={average} stroke="#0f172a" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
              contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 10 }}
              formatter={(value: number) => [`${value} score`, "Compliance"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
