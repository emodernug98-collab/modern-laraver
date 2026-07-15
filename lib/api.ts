/**
 * Central API client for the Laravel backend.
 *
 * All server-side calls use API_URL (internal).
 * All client-side calls use NEXT_PUBLIC_API_URL (public).
 */

/**
 * Resolve the backend base URL.
 *
 * Order of precedence:
 *   1. process.env.API_URL (server-side)
 *   2. process.env.NEXT_PUBLIC_API_URL (client-side)
 *   3. http://localhost:8000/api when NODE_ENV !== "production"
 *      (so a missing .env.local doesn't silently fall through to the live
 *      server during dev — a common cause of "why is my local frontend
 *      still showing prod data?")
 *   4. https://admin.e-modern.ug/api as the final prod default
 */
function resolveApiUrl(): string {
  const fromEnv =
    typeof window === "undefined"
      ? process.env.API_URL
      : process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv;
  if (process.env.NODE_ENV !== "production") return "http://localhost:8000/api";
  return "https://admin.e-modern.ug/api";
}

export const API_URL = resolveApiUrl();

/** Key used to store the auth token in browser storage. Shared with lib/auth.ts. */
export const TOKEN_KEY = "admin_token";

type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

/** Typed JSON fetch helper wrapping the Laravel API. */
export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", body, token, headers = {} }: FetchOptions = {}
): Promise<T> {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body === undefined ? { next: { revalidate: 300 } } : { cache: "no-store" }),
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, init);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error((err as { error?: string }).error ?? res.statusText), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

/** Server-side admin token (from .env.local ADMIN_API_TOKEN). */
export const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "";
