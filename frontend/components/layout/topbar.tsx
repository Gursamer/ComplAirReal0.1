"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export function Topbar() {
  const pathname = usePathname();
  const title = pathname === "/dashboard" ? "Dashboard" : pathname.slice(1).split("/")[0] || "Overview";

  return (
    <header className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
      <div>
        <h1 className="text-lg font-bold capitalize text-text">{title}</h1>
        <p className="text-xs text-slate-500">AI compliance copilot for fintech and SMB teams</p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/upload">
          <Button>New Analysis</Button>
        </Link>
      </div>
    </header>
  );
}
