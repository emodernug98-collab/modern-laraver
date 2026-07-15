"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  isInWishlist,
  toggleWishlist,
  type WishlistItem,
} from "@/lib/wishlist";

type WishlistButtonProps = {
  item: WishlistItem;
  className?: string;
  label?: string;
};

export default function WishlistButton({
  item,
  className,
  label,
}: WishlistButtonProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(isInWishlist(item.id));
    sync();
    window.addEventListener("wishlist:updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlist:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [item.id]);

  return (
    <button
      type="button"
      onClick={() => setActive(toggleWishlist(item))}
      className={className}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={18}
        className={active ? "fill-[#e11d48] text-[#e11d48]" : undefined}
      />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
