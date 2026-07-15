/**
 * Client-side auth helpers backed by the Laravel API.
 *
 * Tokens are stored in localStorage (remember me) or sessionStorage (session only).
 * The profile object mirrors the shape returned by GET /api/auth/me.
 */

import { normalizePhoneNumber } from "@/lib/phone";
import { TOKEN_KEY } from "@/lib/api";

const AUTH_API_BASE = "/api/auth";

const SESSION_KEY = "modern_session_v1";

export type CustomerProfile = {
  id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role?: string;
};

type AuthResponse = {
  ok?: boolean;
  token?: string;
  profile?: CustomerProfile;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

// ─── token helpers ──────────────────────────────────────────

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

function setToken(token: string, remember: boolean) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

// ─── session helpers ─────────────────────────────────────────

function setSession(profile: CustomerProfile) {
  if (!isBrowser()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("auth:updated"));
}

function normalizeProfile(profile: CustomerProfile | undefined): CustomerProfile {
  return {
    id: profile?.id,
    fullName: profile?.fullName ?? "",
    email: profile?.email,
    phone: profile?.phone,
    role: profile?.role,
  };
}

export function getCurrentUser(): CustomerProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

// ─── API helpers ─────────────────────────────────────────────

function getResponseError(data: AuthResponse, fallback: string) {
  if (data.error) return data.error;
  if (data.message) return data.message;

  const firstValidationError = Object.values(data.errors ?? {})[0]?.[0];
  return firstValidationError ?? fallback;
}

async function apiPost<T extends AuthResponse>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${AUTH_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? ((await res.json().catch(() => ({}))) as T)
    : ({ error: await res.text().catch(() => res.statusText) } as T);

  if (!res.ok && !data.error && !data.message) {
    data.error = res.statusText || "Request failed.";
  }

  return data;
}

// ─── public auth functions ────────────────────────────────────

export async function signup(fullName: string, email: string, phone: string, password: string) {
  const normalizedPhone = normalizePhoneNumber(phone.trim()) || phone.trim();
  const payload = {
    full_name: fullName,
    phone: normalizedPhone,
    ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
    password,
  };

  const data = await apiPost<AuthResponse>("/register", payload);

  if (data.error || !data.ok) {
    return { ok: false as const, error: getResponseError(data, "Registration failed.") };
  }

  setToken(data.token!, false);
  const profile = normalizeProfile(data.profile);
  setSession(profile);
  return { ok: true as const, user: profile };
}

export async function login(emailOrPhone: string, password: string) {
  const value = emailOrPhone.trim();
  // Use email field when the value looks like an email, otherwise phone
  const isEmail = value.includes("@");
  const payload = isEmail
    ? { email: value.toLowerCase(), password }
    : { phone: normalizePhoneNumber(value) || value, password };

  const data = await apiPost<AuthResponse>(
    "/login",
    payload
  );

  if (data.error || !data.ok) {
    return { ok: false as const, error: getResponseError(data, "Login failed.") };
  }

  setToken(data.token!, false);
  const profile = normalizeProfile(data.profile);
  setSession(profile);
  return { ok: true as const, user: profile };
}

export async function logout() {
  if (!isBrowser()) return;

  const token = getToken();
  if (token) {
    await fetch(`${AUTH_API_BASE}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => {});
  }

  clearToken();
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("auth:updated"));
}

export function updateCurrentUser(patch: Partial<CustomerProfile>) {
  const current = getCurrentUser();
  if (!current) return null;
  const next: CustomerProfile = { ...current, ...patch };
  setSession(next);
  return next;
}
