import { type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-text outline-none ring-accent transition placeholder:text-slate-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
