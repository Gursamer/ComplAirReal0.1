import { getApiBase } from "@/lib/api";

const TOKEN_KEY = "complyai_access_token";
const EMAIL_KEY = "complyai_user_email";

async function parseOrThrow(response: Response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.detail || `Request failed with status ${response.status}`);
  }
  return data;
}

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getCurrentEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(EMAIL_KEY) || "";
}

export function saveSession(token: string, email: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export async function signup(email: string, password: string): Promise<void> {
  const response = await fetch(`${getApiBase()}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseOrThrow(response);
  saveSession(payload.access_token, payload.user?.email || email);
}

export async function login(email: string, password: string): Promise<void> {
  const response = await fetch(`${getApiBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseOrThrow(response);
  saveSession(payload.access_token, payload.user?.email || email);
}

export async function fetchMe(): Promise<string> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${getApiBase()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const payload = await parseOrThrow(response);
  const email = payload.user?.email || "";
  if (email) {
    localStorage.setItem(EMAIL_KEY, email);
  }
  return email;
}
