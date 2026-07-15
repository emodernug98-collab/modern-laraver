"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Grid3X3, Heart, Home, ShoppingCart, UserRound } from "lucide-react";
import { InteractiveMenu, type InteractiveMenuItem } from "@/components/ui/modern-mobile-menu";
import { cartCount, readCart, type CartItem } from "@/lib/cart";
import { isLoggedIn } from "@/lib/auth";

/**
 * Bottom navigation that appears on `md:hidden` screens.
 *
 * Five tabs: Home · Shop · Wishlist · Cart · Account.
 * (The Search slot was previously a dead clone of Shop — it's now
 * Wishlist, which has a real destination and matches the desktop
 * NavBar wishlist link.)
 *
 * Active-tab matching uses `startsWith` (not `===`) so deep paths
 * like `/category/television` or `/user/orders` still highlight
 * the right tab.
 *
 * Cart badge syncs in real time both inside the tab (via the
 * custom `cart:updated` event that `lib/cart.ts` dispatches) and
 * across tabs (via the native `storage` event when localStorage
 * changes in another tab).
 */
type NavItem = {
  label: string;
  icon: InteractiveMenuItem["icon"];
  href: string;
  match: (path: string) => boolean;
  /** Optional click handler — replaces navigation when provided. */
  onClick?: (ctx: { router: ReturnType<typeof useRouter> }) => void;
};

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    match: (path) => path === "/",
  },
  {
    label: "Shop",
    icon: Grid3X3,
    href: "/category/all",
    match: (path) =>
      path === "/products" ||
      path.startsWith("/category/") ||
      path === "/category",
  },
  {
    label: "Wishlist",
    icon: Heart,
    href: "/wishlist",
    match: (path) => path.startsWith("/wishlist"),
  },
  {
    label: "Cart",
    icon: ShoppingCart,
    href: "/cart",
    match: (path) => path.startsWith("/cart") || path.startsWith("/checkout"),
  },
  {
    label: "Account",
    icon: UserRound,
    href: "/user",
    match: (path) =>
      path.startsWith("/user") ||
      path.startsWith("/profile") ||
      path.startsWith("/dashboard"),
    onClick: ({ router }) => {
      // Logged-in users get their account dashboard; logged-out users
      // get the existing auth modal opened with a post-login redirect
      // back to /user. This mirrors NavBar's desktop behavior.
      if (isLoggedIn()) {
        router.push("/user");
      } else {
        window.dispatchEvent(
          new CustomEvent("auth:modal-open", {
            detail: { mode: "login", redirect: "/user" },
          })
        );
      }
    },
  },
];

export default function MobileAppControls() {
  const pathname = usePathname();
  const router = useRouter();
  const count = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot
  );

  const activePath = pathname || "/";
  const menuItems: InteractiveMenuItem[] = navItems.map((item) => ({
    label: item.label,
    icon: item.icon,
    // Only set href when there's no custom click handler — otherwise the
    // InteractiveMenu wraps it in <Link> which steals the click.
    href: item.onClick ? undefined : item.href,
    active: item.match(activePath),
    badge:
      item.label === "Cart" && count > 0
        ? count > 99
          ? "99+"
          : String(count)
        : undefined,
    ariaLabel:
      item.label === "Cart" && count > 0
        ? `Cart, ${count} items`
        : item.label,
  }));

  const handleSelect = (selected: InteractiveMenuItem, index: number) => {
    const source = navItems[index];
    source?.onClick?.({ router });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 md:hidden">
      <InteractiveMenu
        items={menuItems}
        accentColor="#0f1111"
        onSelect={handleSelect}
      />
    </div>
  );
}

// ─── external store wiring ─────────────────────────────────────────

/**
 * Cached snapshot. `useSyncExternalStore` calls `getSnapshot()` on every
 * render to decide whether to schedule an update; if the value isn't
 * stable across calls (Object.is) it'll re-render in a loop. We compute
 * the count lazily inside `subscribe` whenever the cart actually
 * changes, then hand React the cached primitive.
 */
let cachedCount = 0;
let cachedItems: CartItem[] | null = null;

function recomputeFromStorage() {
  cachedItems = readCart();
  cachedCount = cartCount(cachedItems);
}

function subscribeToCart(onStoreChange: () => void) {
  // Defensive: useSyncExternalStore only calls this on the client, but
  // guarding against SSR makes the helper safe to reuse elsewhere.
  if (typeof window === "undefined") return () => {};

  recomputeFromStorage();

  const handle = () => {
    recomputeFromStorage();
    onStoreChange();
  };

  // Same-tab updates (writeCart() dispatches this synchronously).
  window.addEventListener("cart:updated", handle);
  // Cross-tab updates: fires on every other tab when localStorage
  // changes here. Filter to our cart key to avoid spurious wakeups.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === "modern_cart_v1") handle();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("cart:updated", handle);
    window.removeEventListener("storage", onStorage);
  };
}

function getCartSnapshot() {
  // First render after mount — `subscribeToCart` hasn't run yet, so
  // populate the cache once on demand. Subsequent calls reuse it.
  if (cachedItems === null) recomputeFromStorage();
  return cachedCount;
}

function getServerCartSnapshot() {
  // Server has no localStorage — always 0. Client hydrates with the
  // real count on first effect, which `useSyncExternalStore` handles
  // without a hydration warning.
  return 0;
}
