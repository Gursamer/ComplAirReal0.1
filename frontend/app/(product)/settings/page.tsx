"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const DEFAULT_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function SettingsPage() {
  const [apiBase, setApiBase] = useState(DEFAULT_API);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("complyai_api_base");
    if (stored) setApiBase(stored);
  }, []);

  const onSave = () => {
    localStorage.setItem("complyai_api_base", apiBase);
    localStorage.setItem("complyai_theme", "light");
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">API base URL</label>
            <Input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Theme</p>
            <p className="mt-1 text-sm text-slate-700">Light mode is now the default application theme.</p>
          </div>
          <Button onClick={onSave}>Save settings</Button>
          {saved && <p className="text-sm text-emerald-700">Saved.</p>}
        </div>
      </Card>
    </div>
  );
}
