import { DemoAuthGate } from "@/components/layout/demo-auth-gate";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { type ReactNode } from "react";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return (
    <DemoAuthGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="w-full p-4 md:p-6">
          <Topbar />
          {children}
        </main>
      </div>
    </DemoAuthGate>
  );
}
