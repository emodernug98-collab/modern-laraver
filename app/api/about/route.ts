import { proxyToLaravel } from "@/lib/proxy";

export async function GET() {
  return proxyToLaravel("GET", "/pages/about");
}
