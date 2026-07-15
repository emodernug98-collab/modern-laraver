import { proxyToLaravel } from "@/lib/proxy";

type Context = {
  params: Promise<{ path: string[] }>;
};

export async function GET(_: Request, context: Context): Promise<Response> {
  const { path } = await context.params;
  return proxyToLaravel("GET", `/media/${path.map(encodeURIComponent).join("/")}`);
}
