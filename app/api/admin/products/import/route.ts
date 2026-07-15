import { NextRequest } from "next/server";
import { API_URL, ADMIN_API_TOKEN } from "@/lib/api";

export async function POST(request: NextRequest) {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    ADMIN_API_TOKEN;

  // Forward the multipart/form-data (CSV file) directly to Laravel
  const formData = await request.formData();

  const res = await fetch(`${API_URL}/admin/products/import`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    cache: "no-store",
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
