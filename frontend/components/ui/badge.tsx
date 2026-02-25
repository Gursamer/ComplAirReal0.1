import { cn } from "@/lib/utils";

type Severity = "low" | "medium" | "high";

const classes: Record<Severity, string> = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  high: "bg-rose-100 text-rose-800 border-rose-300",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize", classes[severity])}>
      {severity} risk
    </span>
  );
}
