"use client";

import type { FrontendData } from "@/lib/frontend-data";
import {
  cloneDefaultFrontendData,
  mergeFrontendData,
} from "@/lib/frontend-data-merge";

const KEY = "modern_frontend_data_v2";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readLocalFrontendData(): FrontendData {
  if (!canUseStorage()) return cloneDefaultFrontendData();

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return cloneDefaultFrontendData();
    return mergeFrontendData(JSON.parse(raw));
  } catch {
    return cloneDefaultFrontendData();
  }
}

function writeLocalFrontendData(data: FrontendData) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function readFrontendData(): FrontendData {
  return readLocalFrontendData();
}

export async function fetchFrontendData(): Promise<FrontendData> {
  try {
    const endpoint =
      typeof window === "undefined"
        ? `${process.env.API_URL ?? (process.env.NODE_ENV !== "production" ? "http://localhost:8000/api" : "https://admin.e-modern.ug/api")}/frontend-data`
        : "/api/frontend-data";

    const response = await fetch(endpoint, {
      method: "GET",
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const payload = (await response.json()) as { data?: unknown };
    const data = mergeFrontendData(payload.data);
    writeLocalFrontendData(data);
    return data;
  } catch {
    return readLocalFrontendData();
  }
}

/**
 * Saves to Laravel first — localStorage is only ever updated after a
 * confirmed server save, and a failed save throws instead of silently
 * appearing to succeed via a local-only write (previously this wrote to
 * localStorage unconditionally before the network call, so a failed PUT
 * could leave an admin's browser looking "saved" when Laravel never
 * received the change).
 */
export async function writeFrontendData(data: FrontendData) {
  const endpoint =
    typeof window === "undefined"
      ? `${process.env.API_URL ?? (process.env.NODE_ENV !== "production" ? "http://localhost:8000/api" : "https://admin.e-modern.ug/api")}/admin/frontend-data`
      : "/api/frontend-data";

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") || "")
      : (process.env.ADMIN_API_TOKEN ?? "");

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = "Failed to save frontend data.";

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { error?: string };
        message = parsed.error || message;
      } catch {
        message = raw;
      }
    }

    throw new Error(message);
  }

  const payload = (await response.json().catch(() => null)) as { data?: unknown } | null;
  const saved = payload?.data ? mergeFrontendData(payload.data) : data;
  writeLocalFrontendData(saved);

  if (canUseStorage()) {
    window.dispatchEvent(new Event("frontend-data:updated"));
  }

  return saved;
}

export async function resetFrontendData() {
  await writeFrontendData(cloneDefaultFrontendData());
}
