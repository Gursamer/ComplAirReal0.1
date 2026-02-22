"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Item {
  name: string;
  score: number;
}

export function ClauseRiskBar({ data }: { data: Item[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-30} textAnchor="end" height={70} />
          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Bar dataKey="score" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
