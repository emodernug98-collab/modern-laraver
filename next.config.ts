import type { NextConfig } from "next";

const immutableAssetHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "https://admin.e-modern.ug/api",
  },

  // CSS/JS minification: Next uses SWC's minifier in production by default
  // (handles JS, JSX, TS, and CSS via lightningcss). Nothing to enable —
  // verify by building and inspecting .next/static/chunks/*.js (they'll be
  // single-line, mangled output).
  //
  // HTTP-level gzip: enabled here for Node-server deployments. No-op on
  // Cloudflare Pages — CF applies Brotli/gzip on its edge automatically —
  // but harmless to leave on.
  compress: true,

  // Drop the "x-powered-by: Next.js" response header.
  poweredByHeader: false,

  // Removes console.log calls from client bundles in production. console.error
  // and console.warn still ship so real errors stay visible in Sentry/etc.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  images: {
    // Allow product images from Laravel storage and external product feeds.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    // Generate WebP + AVIF for supported browsers (~60-80% smaller than JPEG/PNG)
    formats: ["image/avif", "image/webp"],
    // Serve images at these breakpoints so browsers pick the right size
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    // Cache optimized images for 30 days on the CDN
    minimumCacheTTL: 2592000,
  },

  async headers() {
    return [
      {
        // Next emits hashed filenames here, so these are safe to cache for a year.
        source: "/_next/static/:path*",
        headers: immutableAssetHeaders,
      },
      {
        // Font filenames include content hashes in globals.css.
        source: "/fonts/:path*",
        headers: immutableAssetHeaders,
      },
      {
        // Preconnect to the backend image origin so the browser opens the
        // TCP connection before images are requested.
        source: "/",
        headers: [
          { key: "Link", value: "<https://admin.e-modern.ug>; rel=preconnect" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
