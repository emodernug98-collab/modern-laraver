export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  href: string;
  qty: number;
};

const CART_KEY = "modern_cart_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.image === "string" &&
        typeof item.href === "string" &&
        typeof item.qty === "number"
    );
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const nextQty = Math.max(1, Math.floor(qty));
  const current = readCart();
  const idx = current.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], qty: current[idx].qty + nextQty };
  } else {
    current.push({ ...item, qty: nextQty });
  }
  writeCart(current);
  window.dispatchEvent(new Event("cart:open"));
}

export function updateQty(id: string, qty: number) {
  const current = readCart();
  const next = current
    .map((item) => (item.id === id ? { ...item, qty: Math.max(1, Math.floor(qty)) } : item))
    .filter((item) => item.qty > 0);
  writeCart(next);
}

export function removeFromCart(id: string) {
  const current = readCart();
  writeCart(current.filter((item) => item.id !== id));
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(items = readCart()) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal(items = readCart()) {
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
}
