"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0f172a", "#2563eb", "#0ea5e9", "#16a34a", "#d97706", "#dc2626"];

interface Item {
  name: string;
  value: number;
}

export function CategoryDonut({ data }: { data: Item[] }) {
  const total = Math.max(
    data.reduce((sum, item) => sum + item.value, 0),
    1,
  );

  return (
    <div className="grid gap-3 md:grid-cols-[1fr,220px]">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={68}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 10 }}
              formatter={(value: number, name) => [`${value} clauses`, `${name}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Total clauses</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{total}</p>
        </div>
        {data.slice(0, 5).map((item, idx) => (
          <div key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="font-medium text-slate-700">{item.name}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {item.value} clauses ({Math.round((item.value / total) * 100)}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
