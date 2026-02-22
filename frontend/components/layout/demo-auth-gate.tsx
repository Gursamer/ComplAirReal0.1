"use client";

import { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function DemoAuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("demo@complyai.app");
  const [password, setPassword] = useState("demo123");

  useEffect(() => {
    const token = localStorage.getItem("complyai_demo_token");
    setAuthed(Boolean(token));
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-xl font-bold text-text">Demo Sign In</h2>
          <p className="mt-1 text-sm text-slate-600">Use any email/password for investor demo mode.</p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim() || !password.trim()) return;
              localStorage.setItem("complyai_demo_token", "demo-session");
              localStorage.setItem("complyai_demo_email", email);
              setAuthed(true);
            }}
          >
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              type="password"
            />
            <Button className="w-full" type="submit">
              Enter Dashboard
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
