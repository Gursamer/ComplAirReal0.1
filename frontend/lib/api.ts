import { normalizeReport } from "@/lib/normalize";
import { type NormalizedReport, type ReportListItem, type ReportListResponse, type RawReport } from "@/lib/types";

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return localStorage.getItem("complyai_api_base") || DEFAULT_API_BASE;
}

async function parseOrThrow(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.detail || `Request failed with status ${response.status}`);
  }
  return data;
}

export async function analyzeDocument(file: File, profile: string): Promise<NormalizedReport> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("profile", profile);

  const response = await fetch(`${getApiBase()}/analyze`, {
    method: "POST",
    body: formData,
  });

  const raw = (await parseOrThrow(response)) as RawReport;
  return normalizeReport(raw);
}

export async function getReport(reportId: string): Promise<NormalizedReport> {
  const response = await fetch(`${getApiBase()}/reports/${reportId}`, { cache: "no-store" });
  const raw = (await parseOrThrow(response)) as RawReport;
  return normalizeReport(raw);
}

export async function listReports(): Promise<ReportListItem[]> {
  const response = await fetch(`${getApiBase()}/reports`, { cache: "no-store" });
  const data = (await parseOrThrow(response)) as ReportListResponse;

  return (data.reports || []).map((item) => ({
    id: item.id,
    filename: item.source_file || "Untitled document",
    timestamp: item.timestamp || new Date().toISOString(),
    score: item.score,
    severity: item.severity,
  }));
}
