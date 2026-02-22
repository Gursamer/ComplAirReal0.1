import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

export function KeyFindings({ items }: { items: string[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold text-text">Key Findings</h3>
      <ul className="mt-4 space-y-2">
        {items.slice(0, 5).map((item, index) => (
          <motion.li
            key={`${item}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}
