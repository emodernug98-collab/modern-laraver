"use client";

import { useEffect, useState } from "react";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import { readRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";
import type { RelatedProduct } from "@/lib/frontend-data";

function toRelatedProduct(item: RecentlyViewedItem): RelatedProduct {
  return {
    id: item.id,
    title: item.name,
    image: item.image,
    href: item.href,
    rating: 0,
    reviews: "",
  };
}

export default function PreviouslyBrowsedProductsRow({
  currentProductId,
}: {
  currentProductId?: string;
}) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    const sync = () => {
      const next = readRecentlyViewed()
        .filter((item) => item.id !== currentProductId)
        .map(toRelatedProduct);
      setProducts(next);
    };

    sync();
    window.addEventListener("recently-viewed:updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recently-viewed:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [currentProductId]);

  return (
    <RelatedProductsCarousel
      products={products}
      title="Previously browsed"
      sponsoredLabel={null}
      pageLabel={null}
    />
  );
}
