import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type ReactNode } from "react";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-transparent">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_84%_6%,rgba(139,92,246,0.14),transparent_28%)]" />
      <Sidebar />
      <main className="relative w-full p-4 md:p-6">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
