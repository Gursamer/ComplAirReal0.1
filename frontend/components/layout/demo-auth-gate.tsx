"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchMe } from "@/lib/auth";

export function DemoAuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await fetchMe();
        if (mounted) setReady(true);
      } catch {
        router.replace("/login");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-fuchsia-400" />
      </main>
    );
  }

  return <>{children}</>;
}
