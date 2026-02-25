"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Item {
  name: string;
  value: number;
}

export function CategoryBarChart({ data }: { data: Item[] }) {
  const total = Math.max(
    data.reduce((sum, item) => sum + item.value, 0),
    1,
  );
  const enriched = data.map((item) => ({
    ...item,
    share: Math.round((item.value / total) * 100),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={enriched}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-20} textAnchor="end" height={62} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 10 }}
            formatter={(value: number, key) => [key === "value" ? `${value} clauses` : `${value}%`, key === "value" ? "Count" : "Share"]}
          />
          <Bar dataKey="value" fill="#0f172a" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="share" position="top" formatter={(value: number) => `${value}%`} className="fill-slate-500 text-xs" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
