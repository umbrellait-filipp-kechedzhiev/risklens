import type { RiskReport } from "@risklens/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Session = {
  accessToken: string;
  user: { id: string; email: string; name: string; workspaceId: string };
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("risklens_session");
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function setSession(session: Session) {
  window.localStorage.setItem("risklens_session", JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem("risklens_session");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(session ? { authorization: `Bearer ${session.accessToken}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Запрос не выполнен" }));
    if (response.status === 401 && typeof window !== "undefined") {
      clearSession();
      window.location.href = "/login";
    }
    throw new Error(error.message ?? "Запрос не выполнен");
  }
  const contentType = response.headers.get("content-type") ?? "";
  return (contentType.includes("application/json") ? response.json() : response.text()) as Promise<T>;
}

export type ProjectListItem = {
  id: string;
  name: string;
  description: string;
  projectType: string;
  stage: string;
  deliveryModel: string;
  businessCriticality: string;
  updatedAt: string;
  latestReview: { id: string; overallScore: number | null; riskLevel: string | null; createdAt: string } | null;
};

export type { RiskReport };
