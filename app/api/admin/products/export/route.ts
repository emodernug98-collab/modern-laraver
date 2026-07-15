import { NextRequest } from "next/server";
import { API_URL, ADMIN_API_TOKEN } from "@/lib/api";

export async function GET(request: NextRequest) {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    ADMIN_API_TOKEN;

  const res = await fetch(`${API_URL}/admin/products/export`, {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "text/csv",
      "Content-Disposition":
        res.headers.get("Content-Disposition") ??
        'attachment; filename="products-export.csv"',
    },
  });
}
