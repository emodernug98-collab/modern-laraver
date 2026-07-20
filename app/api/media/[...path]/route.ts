import { proxyToLaravel } from "@/lib/proxy";

type Context = {
  params: Promise<{ path: string[] }>;
};

const FALLBACK_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="Image unavailable"><rect width="800" height="800" fill="#f3f4f6"/><path d="M185 560h430L489 410 394 525l-65-78-144 113Z" fill="#d1d5db"/><circle cx="515" cy="285" r="55" fill="#d1d5db"/><rect x="145" y="175" width="510" height="450" rx="28" fill="none" stroke="#cbd5e1" stroke-width="28"/></svg>`;

export async function GET(_: Request, context: Context): Promise<Response> {
  const { path } = await context.params;
  const response = await proxyToLaravel("GET", `/media/${path.map(encodeURIComponent).join("/")}`);

  if (response.status === 404) {
    return new Response(FALLBACK_IMAGE_SVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  return response;
}
