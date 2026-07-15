"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { addToCart } from "@/lib/cart";
import SafeImage from "@/components/SafeImage";
import type { FeaturedSidebarProduct } from "@/lib/products-public";

export default function FeaturedItemsSidebar() {
  const [products, setProducts] = useState<FeaturedSidebarProduct[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/products/featured", { cache: "no-store" });
        const payload = (await response.json()) as { products?: FeaturedSidebarProduct[] };
        if (active) {
          setProducts(Array.isArray(payload.products) ? payload.products : []);
        }
      } catch {
        if (active) {
          setProducts([]);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <aside className="w-full rounded-[8px] border border-[#d5d9d9] bg-white p-5">
      <h2 className="mb-4 text-[20px] font-bold leading-[26px] text-[#0f1111]">
        Featured items you may like
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <FeaturedProductCard key={product.id} product={product} />
        ))}
      </div>
    </aside>
  );
}

function FeaturedProductCard({ product }: { product: FeaturedSidebarProduct }) {
  return (
    <div className="flex min-w-[280px] max-w-[320px] flex-1 items-start gap-4 rounded-lg border border-gray-100 p-3">
      <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center">
        <SafeImage
          src={product.image}
          alt={product.title}
          width={88}
          height={88}
          sizes="88px"
          className="max-h-[88px] max-w-[88px] object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={product.href}
          className="line-clamp-2 text-[15px] leading-[20px] text-[#2162a1] hover:text-[#c7511f] hover:underline"
        >
          {product.title}
        </Link>

        <div className="mt-1 flex items-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: product.rating }).map((_, index) => (
              <Star
                key={index}
                className="h-[16px] w-[16px] fill-[#ff7a00] text-[#ff7a00]"
                strokeWidth={1.7}
              />
            ))}
          </div>
          <span className="text-[14px] text-[#2162a1]">{product.reviews}</span>
        </div>

        <div className="mt-1 flex items-start gap-[1px] text-[#0f1111]">
          <span className="pt-[2px] text-[13px] leading-none">{product.currencyCode}</span>
          <span className="text-[28px] font-normal leading-[28px]">
            {product.priceWhole}
          </span>
          <span className="pt-[3px] text-[13px] leading-none">
            {product.priceDecimal}
          </span>
          {product.extraPrice ? (
            <span className="ml-1 pt-[8px] text-[13px] leading-none text-[#0f1111]">
              {product.extraPrice}
            </span>
          ) : null}
        </div>

        {product.delivery ? (
          <p className="mt-1 text-[14px] leading-[19px] text-[#0f1111]">
            {product.delivery}
          </p>
        ) : null}

        <p className="mt-1 text-[14px] leading-[19px] text-[#0f1111]">
          {product.shipping}
        </p>

        <button
          type="button"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.title,
              price: product.price,
              image: product.image,
              href: product.href,
            })
          }
          className="mt-2 inline-flex h-[31px] items-center justify-center rounded-full bg-[#ffd814] px-4 text-[14px] font-medium text-[#0f1111] shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)] hover:bg-[#f7ca00]"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
