/**
 * Thin proxy utility — forwards Next.js route handler requests
 * straight to the Laravel backend and returns the response.
 */
import { NextRequest } from "next/server";
import { API_URL, ADMIN_API_TOKEN } from "@/lib/api";

/**
 * @param method   HTTP verb
 * @param path     Laravel API path, e.g. "/products/featured"
 * @param request  Original NextRequest (used to forward Authorization + body).
 *                 May be omitted for simple GET calls that need no auth.
 */
export async function proxyToLaravel(
  method: string,
  path: string,
  request?: NextRequest
): Promise<Response> {
  // Resolve the bearer token:
  //  1. Authorization header forwarded from the browser
  //  2. Server-side ADMIN_API_TOKEN from .env.local (for protected admin SSR calls)
  const token =
    request?.headers.get("authorization")?.replace("Bearer ", "") ||
    ADMIN_API_TOKEN ||
    null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const init: RequestInit = { method, headers, cache: "no-store" };

  // Forward the request body for POST / PUT / PATCH
  if (request && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      headers["Content-Type"] = "application/json";
      init.body = await request.text();
    } else if (contentType.includes("multipart/form-data")) {
      // Let fetch set its own boundary; do NOT set Content-Type manually
      init.body = await request.formData();
    } else {
      init.body = request.body;
    }
  }

  const res = await fetch(`${API_URL}${path}`, init);

  const responseContentType = res.headers.get("content-type") ?? "application/json";

  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": responseContentType },
  });
}
