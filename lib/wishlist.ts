export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
};

const WISHLIST_KEY = "modern_wishlist_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readWishlist(): WishlistItem[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.image === "string" &&
        typeof item.href === "string"
    );
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("wishlist:updated"));
}

export function isInWishlist(id: string) {
  return readWishlist().some((item) => item.id === id);
}

export function addToWishlist(item: WishlistItem) {
  const current = readWishlist();
  if (current.some((entry) => entry.id === item.id)) {
    return;
  }
  writeWishlist([...current, item]);
}

export function removeFromWishlist(id: string) {
  writeWishlist(readWishlist().filter((item) => item.id !== id));
}

export function toggleWishlist(item: WishlistItem) {
  if (isInWishlist(item.id)) {
    removeFromWishlist(item.id);
    return false;
  }

  addToWishlist(item);
  return true;
}

export function clearWishlist() {
  writeWishlist([]);
}
