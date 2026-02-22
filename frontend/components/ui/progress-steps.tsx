import { motion } from "framer-motion";

const labels = [
  "Extracting clauses...",
  "Matching regulations...",
  "Scoring risk...",
  "Generating fixes...",
];

export function ProgressSteps({ stage }: { stage: number }) {
  return (
    <div className="space-y-3">
      {labels.map((label, index) => {
        const active = index <= stage;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0.3, x: -8 }}
            animate={{ opacity: active ? 1 : 0.45, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-accent" : "bg-slate-300"}`} />
            <span className="text-sm text-slate-700">{label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
