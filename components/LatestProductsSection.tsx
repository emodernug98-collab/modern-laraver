"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { addToCart } from "@/lib/cart";
import { normalizeMediaUrl } from "@/lib/media";
import type { LatestProduct } from "@/lib/frontend-data";
import WishlistButton from "@/components/WishlistButton";

type ProductFeedItem = LatestProduct & {
  renderKey: string;
  isFresh: boolean;
};

type LatestProductsSectionProps = {
  title: string;
  ctaHref: string;
  ctaLabel: string;
  products: LatestProduct[];
};

const PAGE_SIZE = 10;

function splitUGX(n: number) {
  const formatted = n.toLocaleString("en-US");
  return {
    currency: "UGX",
    whole: formatted,
  };
}

function Rating({ value = 0 }: { value?: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1 text-gray-300">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          strokeWidth={1.7}
          className={[
            "h-3.5 w-3.5 sm:h-[15px] sm:w-[15px]",
            i < full ? "fill-[#ff7a00] text-[#ff7a00]" : "",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function toFeedItems(products: LatestProduct[], startIndex: number) {
  return products.map((product, index) => ({
    ...product,
    renderKey: `${product.id}-${startIndex + index}`,
    isFresh: startIndex > 0,
  }));
}

export default function LatestProductsSection({
  title,
  ctaHref,
  ctaLabel,
  products,
}: LatestProductsSectionProps) {
  const [items, setItems] = useState<ProductFeedItem[]>(() => toFeedItems(products, 0));
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);
  const offsetRef = useRef(products.length);
  const renderIndexRef = useRef(products.length);

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting) {
          void fetchMore(offsetRef, renderIndexRef, isLoadingRef, {
            setItems,
            setIsLoading,
            setRequestCount,
          });
        }
      },
      {
        rootMargin: "900px 0px",
        threshold: 0.01,
      }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (items.length === 0 || !items.some((item) => item.isFresh)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setItems((current) =>
        current.map((item) => (item.isFresh ? { ...item, isFresh: false } : item))
      );
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [items]);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-2 py-5 sm:w-[98%] sm:px-4 sm:py-8">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 sm:text-[24px]">{title}</h2>
            <p className="mt-1 hidden text-[14px] text-gray-500 sm:block">
              Fresh catalog picks that keep loading as you browse.
            </p>
          </div>
          <Link
            href={ctaHref}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-[#0b63ce] transition hover:border-[#0b63ce]/30 hover:bg-[#0b63ce]/5 sm:px-4 sm:py-2 sm:text-[13px]"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-3 xl:gap-6 2xl:grid-cols-4">
          {items.map((product, i) => (
            <ProductCard key={product.renderKey} product={product} priority={i < 4} />
          ))}
          {isLoading ? Array.from({ length: Math.min(PAGE_SIZE, 8) }).map((_, index) => <ProductSkeleton key={`skeleton-${requestCount}-${index}`} />) : null}
        </div>

        <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />
      </div>
    </section>
  );
}

async function fetchMore(
  offsetRef: MutableRefObject<number>,
  renderIndexRef: MutableRefObject<number>,
  isLoadingRef: MutableRefObject<boolean>,
  controls: {
    setItems: Dispatch<SetStateAction<ProductFeedItem[]>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setRequestCount: Dispatch<SetStateAction<number>>;
  }
) {
  if (isLoadingRef.current) {
    return;
  }

  isLoadingRef.current = true;
  controls.setIsLoading(true);
  controls.setRequestCount((count) => count + 1);

  try {
    const response = await fetch(`/api/products/latest?offset=${offsetRef.current}&limit=${PAGE_SIZE}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load more products.");
    }

    const payload = (await response.json()) as {
      products?: LatestProduct[];
      nextOffset?: number;
    };
    const incoming = Array.isArray(payload.products) ? payload.products : [];

    if (incoming.length === 0) {
      return;
    }

    const nextStart = renderIndexRef.current;
    const appendedItems = toFeedItems(incoming, nextStart);

    startTransition(() => {
      controls.setItems((current) => [...current, ...appendedItems]);
    });

    offsetRef.current = payload.nextOffset ?? offsetRef.current + incoming.length;
    renderIndexRef.current = nextStart + incoming.length;
  } catch (error) {
    console.error("Failed to append products in the home feed.", error);
  } finally {
    isLoadingRef.current = false;
    controls.setIsLoading(false);
  }
}

function ProductCard({ product: p, priority }: { product: ProductFeedItem; priority?: boolean }) {
  const price = splitUGX(p.price);

  return (
    <article
      className={[
        "group overflow-hidden rounded-lg border border-[#d5d9d9] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
        p.isFresh ? "latest-product-enter" : "",
      ].join(" ")}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <WishlistButton
          item={{
            id: p.id,
            name: p.name,
            price: p.price,
            image: normalizeMediaUrl(p.image),
            href: p.href,
          }}
          className="absolute right-1.5 top-1.5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm transition hover:bg-white sm:right-2.5 sm:top-2.5 sm:h-8 sm:w-8"
        />

        <Link href={p.href} aria-label={p.name} className="absolute inset-0">
          <SafeImage
            src={p.image}
            alt={p.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
            className="p-2 object-contain transition-transform duration-500 group-hover:scale-[1.04] sm:p-3"
          />
        </Link>
      </div>

      <div className="flex min-h-[142px] flex-col p-2.5 sm:min-h-[198px] sm:p-4">
        <Link
          href={p.href}
          className="line-clamp-2 text-[12px] leading-[16px] text-[#2162a1] transition hover:text-[#c7511f] hover:underline sm:text-[15px] sm:leading-[20px]"
          title={p.name}
        >
          {p.name}
        </Link>

        <p className="mt-0.5 line-clamp-1 text-[11px] leading-[15px] text-[#565959] sm:mt-1 sm:text-[13px] sm:leading-[18px]">
          {p.shortDesc}
        </p>

        <div className="mt-1 flex items-center gap-1 sm:mt-1.5">
          <Rating value={p.rating} />
          <span className="text-[11px] text-[#2162a1] sm:text-[13px]">0</span>
        </div>

        <div className="mt-1 flex items-start gap-[2px] text-[#0f1111]">
          <span className="pt-[2px] text-[10px] leading-none sm:text-[12px]">{price.currency}</span>
          <span className="text-[19px] font-normal leading-[21px] sm:text-[26px] sm:leading-[28px]">
            {price.whole}
          </span>
        </div>

        <p className="mt-0.5 text-[11px] leading-[15px] text-[#0f1111] sm:mt-1 sm:text-[13px] sm:leading-[18px]">
          Fast delivery available
        </p>

        <p className="mb-3 hidden text-[13px] leading-[18px] text-[#0f1111] sm:block">
          Eligible for pickup
        </p>

        <div className="mt-auto">
          <button
            onClick={() =>
              addToCart({
                id: p.id,
                name: p.name,
                price: p.price,
                image: normalizeMediaUrl(p.image),
                href: p.href,
              })
            }
            className="inline-flex h-[28px] shrink-0 items-center justify-center rounded-full bg-[#ffd814] px-3 text-[12px] font-medium text-[#0f1111] shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] transition hover:bg-[#f7ca00] sm:h-[32px] sm:px-4 sm:text-[13px]"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="aspect-[4/3] w-full animate-pulse bg-[linear-gradient(90deg,#f3f4f6_0%,#e5e7eb_50%,#f3f4f6_100%)]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
        <div className="h-5 w-1/2 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-gray-100" />
        <div className="h-10 w-full animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
