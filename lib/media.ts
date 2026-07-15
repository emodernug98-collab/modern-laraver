/**
 * Media URL resolution.
 *
 * Two modes:
 *
 *  1. CDN mode (preferred for production) — when
 *     NEXT_PUBLIC_IMAGE_CDN_URL is set, every /storage/... or
 *     /api/media/... path is rewritten to that origin, e.g.
 *
 *         /storage/products/abc.jpg
 *           → https://cdn.e-modern.ug/products/abc.jpg
 *
 *     This is the Jumia-style pattern: a dedicated image host
 *     separate from the app domain. The browser opens parallel
 *     connections, the CDN caches aggressively, and the app
 *     domain is freed from image traffic entirely.
 *
 *  2. Proxy mode (default / dev fallback) — when no CDN is
 *     configured, images go through /api/media/<path>, which the
 *     Next.js route handler proxies to Laravel. Slower, but works
 *     out of the box.
 *
 * The CDN env var is read at module load. To change it, restart
 * the Next.js dev server (env vars are baked into the bundle).
 */

const RAW_CDN =
  process.env.NEXT_PUBLIC_IMAGE_CDN_URL ??
  process.env.NEXT_PUBLIC_IMAGE_CDN ??
  "";

/** Trimmed CDN base URL (no trailing slash). Empty string = disabled. */
export const IMAGE_CDN_URL = RAW_CDN.trim().replace(/\/+$/, "");

/** Whether a dedicated image CDN is configured. */
export const HAS_IMAGE_CDN = IMAGE_CDN_URL.length > 0;

/** Hostname of the configured CDN, for preconnect tags. Empty if disabled. */
export const IMAGE_CDN_ORIGIN: string = (() => {
  if (!HAS_IMAGE_CDN) return "";
  try {
    return new URL(IMAGE_CDN_URL).origin;
  } catch {
    return "";
  }
})();

export function buildMediaProxyUrl(path: string): string {
  return `/api/media/${path.replace(/^\/+/, "")}`;
}

function buildCdnUrl(path: string): string {
  return `${IMAGE_CDN_URL}/${path.replace(/^\/+/, "")}`;
}

/** Pick CDN when configured, otherwise fall back to the Next.js media proxy. */
function rewriteToImageOrigin(path: string): string {
  return HAS_IMAGE_CDN ? buildCdnUrl(path) : buildMediaProxyUrl(path);
}

export function normalizeMediaUrl(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/api/media/")
  ) {
    return url;
  }

  if (url.startsWith("/storage/")) {
    return rewriteToImageOrigin(url.replace(/^\/storage\//, ""));
  }

  try {
    const parsed = new URL(url);

    // Don't rewrite URLs already on the CDN.
    if (HAS_IMAGE_CDN && parsed.origin === IMAGE_CDN_ORIGIN) {
      return url;
    }

    const storageMatch = parsed.pathname.match(/^\/storage\/(.+)$/);
    const mediaMatch = parsed.pathname.match(/^\/api\/media\/(.+)$/);

    if (storageMatch) return rewriteToImageOrigin(storageMatch[1]);
    if (mediaMatch) return rewriteToImageOrigin(mediaMatch[1]);
  } catch {
    return url;
  }

  return url;
}
