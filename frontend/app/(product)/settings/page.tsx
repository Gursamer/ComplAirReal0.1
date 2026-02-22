"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const DEFAULT_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function SettingsPage() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState("light");
  const [demoEmail, setDemoEmail] = useState("demo@complyai.app");

  useEffect(() => {
    const stored = localStorage.getItem("complyai_api_base");
    if (stored) setApiBase(stored);
    const storedTheme = localStorage.getItem("complyai_theme");
    if (storedTheme) setTheme(storedTheme);
    const storedEmail = localStorage.getItem("complyai_demo_email");
    if (storedEmail) setDemoEmail(storedEmail);
  }, []);

  const onSave = () => {
    localStorage.setItem("complyai_api_base", apiBase);
    localStorage.setItem("complyai_theme", theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-text">Settings</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">API base URL</label>
            <Input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Theme</label>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")}>
                Light
              </Button>
              <Button variant={theme === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")}>
                Dark (demo)
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600">Demo account</p>
            <p className="text-sm text-slate-700">{demoEmail}</p>
          </div>
          <Button onClick={onSave}>Save settings</Button>
          {saved && <p className="text-sm text-emerald-700">Saved.</p>}
        </div>
      </Card>
    </div>
  );
}
