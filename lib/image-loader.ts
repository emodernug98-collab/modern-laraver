/**
 * Custom Next/Image loader that targets a dedicated image CDN.
 *
 * When NEXT_PUBLIC_IMAGE_CDN_URL is set, every Next/Image render
 * routes through this function instead of Next's built-in
 * /_next/image optimizer. The output URL points directly at the
 * CDN, so:
 *
 *  - The Next.js worker on Cloudflare Pages is bypassed for images
 *    (saves Worker CPU time and per-request cost).
 *  - The browser sees a separate origin → parallel connections,
 *    no app cookies, dedicated CF edge cache.
 *  - The CDN does the resize/encode (AVIF/WebP) at the edge.
 *
 * Three transform modes — pick via NEXT_PUBLIC_IMAGE_CDN_TRANSFORM:
 *
 *  - "cf-resizing"  Cloudflare Image Resizing path syntax (default):
 *                     https://cdn.example.com/cdn-cgi/image/width=400,quality=75,format=auto/<path>
 *                   Requires Cloudflare "Image Resizing" enabled
 *                   (Pro plan or above) on the CDN hostname.
 *
 *  - "query"        Query-string CDNs (imgix, imagekit, bunny etc.):
 *                     https://cdn.example.com/<path>?width=400&quality=75&format=auto
 *
 *  - "none"         Pass-through: the CDN URL is returned as-is,
 *                   no resize/quality params. Use when serving
 *                   pre-optimised assets straight from object
 *                   storage (R2 / S3) with no resizing tier.
 *
 * If NEXT_PUBLIC_IMAGE_CDN_URL is empty, callers should fall back
 * to Next's default optimizer. SafeImage handles that switch.
 */

import { HAS_IMAGE_CDN, IMAGE_CDN_URL } from "@/lib/media";

type TransformMode = "cf-resizing" | "query" | "none";

const RAW_MODE = (
  process.env.NEXT_PUBLIC_IMAGE_CDN_TRANSFORM ??
  "cf-resizing"
).toLowerCase();

export const IMAGE_CDN_TRANSFORM: TransformMode =
  RAW_MODE === "query" || RAW_MODE === "none" ? RAW_MODE : "cf-resizing";

export type ImageLoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

/**
 * Strip the CDN base prefix from a URL so we can re-assemble it
 * with transforms in front of the path. If the URL doesn't belong
 * to our CDN, return the original src untouched (loader should
 * not corrupt third-party hosts like images.unsplash.com).
 */
function pathRelativeToCdn(src: string): string | null {
  if (!HAS_IMAGE_CDN) return null;

  if (src.startsWith("/")) {
    // Already an in-app path; assume it's meant for the CDN root.
    return src.replace(/^\/+/, "");
  }

  if (!src.startsWith(IMAGE_CDN_URL)) {
    return null;
  }

  return src.slice(IMAGE_CDN_URL.length).replace(/^\/+/, "");
}

export function cdnImageLoader({
  src,
  width,
  quality,
}: ImageLoaderArgs): string {
  // No CDN configured → return src as-is. SafeImage shouldn't be
  // invoking this loader in that case, but guard anyway.
  if (!HAS_IMAGE_CDN) return src;

  const path = pathRelativeToCdn(src);

  // Third-party host (Unsplash, Google, etc.) — don't rewrite,
  // let Next's built-in optimizer (or the host itself) handle it.
  if (path === null) return src;

  const q = Math.min(100, Math.max(1, Math.round(quality ?? 75)));
  const w = Math.max(1, Math.round(width));

  switch (IMAGE_CDN_TRANSFORM) {
    case "cf-resizing": {
      // /cdn-cgi/image/<options>/<origin-path>
      // format=auto lets CF pick AVIF/WebP per request based on Accept.
      const opts = `width=${w},quality=${q},format=auto,fit=scale-down`;
      return `${IMAGE_CDN_URL}/cdn-cgi/image/${opts}/${path}`;
    }

    case "query": {
      // Most imgix-compatible CDNs accept ?w=&q=&fm=
      const url = new URL(`${IMAGE_CDN_URL}/${path}`);
      url.searchParams.set("width", String(w));
      url.searchParams.set("quality", String(q));
      url.searchParams.set("format", "auto");
      return url.toString();
    }

    case "none":
    default:
      return `${IMAGE_CDN_URL}/${path}`;
  }
}

export default cdnImageLoader;
