"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Item {
  name: string;
  score: number;
}

export function ClauseRiskBar({ data }: { data: Item[] }) {
  const average = data.length ? Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length) : 0;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-30} textAnchor="end" height={70} />
          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
          <ReferenceLine y={average} stroke="#0f172a" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 10 }}
            formatter={(value: number) => {
              const level = value >= 70 ? "High risk" : value >= 40 ? "Medium risk" : "Low risk";
              return [`${value} (${level})`, "Risk score"];
            }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.score >= 70 ? "#dc2626" : entry.score >= 40 ? "#d97706" : "#16a34a"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
