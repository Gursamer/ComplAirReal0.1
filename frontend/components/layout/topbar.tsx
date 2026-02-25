"use client";

import Link from "next/link";
import { Bell, Home, Plus, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

export function Topbar() {
  const pathname = usePathname();
  const title = pathname === "/dashboard" ? "Dashboard" : pathname.slice(1).split("/")[0] || "Overview";

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 shadow-[0_10px_30px_rgba(2,6,23,0.45)] backdrop-blur">
      <div>
        <h1 className="text-lg font-bold capitalize text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400">AI compliance copilot for fintech and SMB teams</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 md:flex">
          <Search size={15} className="text-slate-400" />
          <input
            className="w-44 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            placeholder="Search reports"
          />
        </div>

        <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-300">
          <Bell size={15} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-500" />
        </button>

        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <Home size={15} />
            Home
          </Button>
        </Link>

        <Link href="/upload">
          <Button className="gap-2 shadow-sm">
            <Plus size={15} />
            New Analysis
          </Button>
        </Link>
      </div>
    </header>
  );
}
