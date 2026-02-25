"use client";

import { motion } from "framer-motion";
import { FileUp, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { analyzeDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Select } from "@/components/ui/select";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function UploadPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState("gdpr");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);

  const validate = (incoming: File) => {
    if (!ALLOWED.includes(incoming.type) && !incoming.name.toLowerCase().endsWith(".pdf")) {
      return "Supported file types: PDF, DOCX, TXT.";
    }
    if (incoming.size > MAX_FILE_SIZE) {
      return "Max upload size is 25MB.";
    }
    return "";
  };

  const onFile = (incoming?: File) => {
    if (!incoming) return;
    const message = validate(incoming);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setFile(incoming);
  };

  const runAnalyze = async () => {
    if (!file) {
      setError("Please choose a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setStage(0);

    const timer = setInterval(() => {
      setStage((prev) => (prev >= 3 ? 3 : prev + 1));
    }, 900);

    try {
      const report = await analyzeDocument(file, profile);
      localStorage.setItem("complyai_last_report", JSON.stringify(report));
      router.push(`/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">Upload + Analyze</h2>
        <p className="mt-1 text-sm text-slate-500">Drop a contract or policy file to generate a compliance report.</p>

        <motion.div
          className={`mt-5 rounded-2xl border-2 border-dashed p-8 text-center transition ${
            dragging ? "border-slate-500 bg-slate-100" : "border-slate-300 bg-slate-50"
          }`}
          whileHover={{ scale: 1.01 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <UploadCloud className="mx-auto text-slate-700" size={28} />
          <p className="mt-3 text-sm text-slate-700">Drag & drop PDF, DOCX, or TXT here</p>
          <p className="mt-1 text-xs text-slate-500">Max 25MB</p>
          <label className="mt-4 inline-flex cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Choose File
            <input
              type="file"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
              accept=".pdf,.docx,.txt"
            />
          </label>
          {file && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700">
              <FileUp size={14} />
              {file.name}
            </div>
          )}
        </motion.div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Analysis profile</label>
            <Select value={profile} onChange={(e) => setProfile(e.target.value)}>
              <option value="gdpr">GDPR-focused</option>
              <option value="soc2">SOC 2-focused</option>
              <option value="pci">PCI DSS-focused</option>
              <option value="multi">Multi-regulation (GDPR + SOC2 + PCI)</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={runAnalyze} disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>

        {loading && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <ProgressSteps stage={stage} />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </Card>
    </div>
  );
}
