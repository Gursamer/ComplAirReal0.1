import { normalizeReport } from "@/lib/normalize";
import { type NormalizedReport, type ReportListItem, type ReportListResponse, type RawReport } from "@/lib/types";

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API_TIMEOUT_MS = 12000;

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return localStorage.getItem("complyai_api_base") || DEFAULT_API_BASE;
}

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("complyai_access_token") || "";
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function parseOrThrow(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.detail || `Request failed with status ${response.status}`);
  }
  return data;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("API request timed out. Is the backend running on http://127.0.0.1:8000?");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeDocument(file: File, profile: string): Promise<NormalizedReport> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("profile", profile);

  const response = await fetchWithTimeout(`${getApiBase()}/analyze`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  const raw = (await parseOrThrow(response)) as RawReport;
  return normalizeReport(raw);
}

export async function getReport(reportId: string): Promise<NormalizedReport> {
  const response = await fetchWithTimeout(`${getApiBase()}/reports/${reportId}`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  const raw = (await parseOrThrow(response)) as RawReport;
  return normalizeReport(raw);
}

export async function downloadReportPdf(reportId: string): Promise<Blob> {
  const response = await fetchWithTimeout(`${getApiBase()}/reports/${reportId}/export.pdf`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const text = await response.text();
    let detail = "";
    try {
      detail = text ? JSON.parse(text).detail : "";
    } catch {
      detail = "";
    }
    throw new Error(detail || `Request failed with status ${response.status}`);
  }
  return response.blob();
}

export async function askReportQuestion(reportId: string, question: string): Promise<{ answer: string; citations: string[]; provider: string }> {
  const response = await fetchWithTimeout(`${getApiBase()}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ report_id: reportId, question }),
  });
  const data = await parseOrThrow(response);
  return {
    answer: String(data.answer || ""),
    citations: Array.isArray(data.citations) ? data.citations.map(String) : [],
    provider: String(data.provider || "stub"),
  };
}

export async function listReports(): Promise<ReportListItem[]> {
  const response = await fetchWithTimeout(`${getApiBase()}/reports`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  const data = (await parseOrThrow(response)) as ReportListResponse;

  return (data.reports || []).map((item) => ({
    id: item.id,
    filename: item.source_file || "Untitled document",
    timestamp: item.timestamp || new Date().toISOString(),
    score: item.score,
    severity: item.severity,
  }));
}
