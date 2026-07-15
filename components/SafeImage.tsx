"use client";

import NextImage from "next/image";
import { useState } from "react";
import { HAS_IMAGE_CDN, IMAGE_CDN_URL, normalizeMediaUrl } from "@/lib/media";
import { cdnImageLoader } from "@/lib/image-loader";

/**
 * When an image URL already lives on our CDN, route it through the
 * custom loader so Next/Image asks the CDN for resized variants
 * (instead of routing through the in-app /_next/image optimizer).
 * Third-party hosts (Unsplash, etc.) and the /api/media proxy
 * continue to use Next's default optimizer.
 */
function pickLoader(src: string) {
  if (!HAS_IMAGE_CDN) return undefined;
  if (src.startsWith(IMAGE_CDN_URL)) return cdnImageLoader;
  return undefined;
}

type SafeImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Use when the parent has position:relative/absolute with defined dimensions */
  fill?: boolean;
  /** Above-the-fold images — skips lazy loading */
  priority?: boolean;
  /** Responsive sizes hint for correct srcset selection */
  sizes?: string;
  width?: number;
  height?: number;
  quality?: number;
};

export default function SafeImage({
  src,
  alt,
  className,
  fill,
  priority = false,
  sizes,
  width,
  height,
  quality = 75,
}: SafeImageProps) {
  const resolved = normalizeMediaUrl(src);
  const imgSrc = resolved;
  const [failed, setFailed] = useState(false);
  const resolvedSizes = sizes ?? (fill ? "100vw" : width ? `${width}px` : "100vw");

  // Don't render anything if the URL is empty or the image failed to load
  if (!imgSrc || failed) {
    return <div className={className} aria-hidden="true" />;
  }

  const handleError = () => setFailed(true);
  const loader = pickLoader(imgSrc);

  if (fill) {
    return (
      <NextImage
        src={imgSrc}
        alt={alt ?? ""}
        fill
        className={className}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={resolvedSizes}
        quality={quality}
        loader={loader}
        onError={handleError}
      />
    );
  }

  return (
    <NextImage
      src={imgSrc}
      alt={alt ?? ""}
      width={width ?? 800}
      height={height ?? 800}
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={resolvedSizes}
      quality={quality}
      loader={loader}
      onError={handleError}
    />
  );
}
