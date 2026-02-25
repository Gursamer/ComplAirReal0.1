import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "relative overflow-hidden border border-emerald-300/30 bg-[linear-gradient(120deg,hsl(var(--accent-start)/0.95),hsl(var(--accent-end)/0.95))] text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] before:absolute before:inset-y-0 before:-left-1/2 before:w-1/3 before:-skew-x-12 before:bg-white/20 before:opacity-0 hover:before:opacity-100 hover:before:translate-x-[320%] before:transition before:duration-500",
  secondary: "border border-slate-300/80 bg-white/90 text-slate-700 hover:bg-white",
  ghost: "bg-transparent text-slate-700 hover:bg-white/70",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "interactive-lift inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
