"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#16a34a", "#d97706", "#dc2626"];

interface Props {
  low: number;
  medium: number;
  high: number;
}

export function RiskDistributionChart({ low, medium, high }: Props) {
  const data = [
    { name: "Low", value: low },
    { name: "Medium", value: medium },
    { name: "High", value: high },
  ];
  const total = Math.max(low + medium + high, 1);

  return (
    <div className="grid gap-3 md:grid-cols-[1fr,220px]">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={2}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 10 }}
              formatter={(value: number, name) => [`${value} reports`, `${name}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="text-xs font-semibold text-slate-500">{Math.round((item.value / total) * 100)}%</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            <div className="mt-2 h-1.5 rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${(item.value / total) * 100}%`, backgroundColor: COLORS[idx] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
