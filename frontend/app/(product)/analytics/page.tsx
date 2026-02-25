"use client";

import { motion } from "framer-motion";

import { CategoryDonut } from "@/components/charts/category-donut";
import { ClauseRiskBar } from "@/components/charts/clause-risk-bar";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  const category = [
    { name: "Privacy", value: 32 },
    { name: "Security", value: 26 },
    { name: "Liability", value: 18 },
    { name: "Retention", value: 12 },
    { name: "Breach", value: 10 },
  ];
  const risks = [
    { name: "C001", score: 72 },
    { name: "C002", score: 66 },
    { name: "C003", score: 58 },
    { name: "C004", score: 54 },
    { name: "C005", score: 41 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-5">
        <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">Deep clause trend and category performance view for investor demos.</p>
      </Card>
      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-semibold text-slate-900">Clause category breakdown</h3>
          <CategoryDonut data={category} />
        </Card>
        <Card className="p-5">
          <h3 className="text-base font-semibold text-slate-900">Risk intensity map</h3>
          <ClauseRiskBar data={risks} />
        </Card>
      </section>
    </motion.div>
  );
}
