"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Home, LineChart, Settings, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/upload", label: "Analyze", icon: UploadCloud },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-slate-800/90 bg-slate-950/70 p-6 backdrop-blur lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[linear-gradient(120deg,hsl(var(--accent-start)/0.95),hsl(var(--accent-end)/0.9))] text-white shadow-[0_0_18px_rgba(16,185,129,0.28)]">
          <BarChart3 size={18} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-100">ComplyAI</p>
          <p className="text-xs text-slate-400">Investor Demo</p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <motion.div key={link.href} whileHover={{ x: 3 }}>
              <Link
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-300 hover:bg-slate-900/70 hover:text-slate-100",
              )}
            >
              <Icon size={16} />
              <span>{link.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}
