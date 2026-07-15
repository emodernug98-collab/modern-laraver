/**
 * Server-side product helpers — fetch from the Laravel API.
 */
import { apiFetch, ADMIN_API_TOKEN } from "@/lib/api";
import type { LatestProduct } from "@/lib/frontend-data";

// ─── admin product list ───────────────────────────────────────

export type AdminProduct = {
  id: string;
  name: string;
  shortDescription: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
};

export async function getProducts(): Promise<AdminProduct[]> {
  try {
    const data = await apiFetch<{ products: AdminProduct[] }>("/admin/products", {
      token: ADMIN_API_TOKEN || null,
    });
    return data.products ?? [];
  } catch (error) {
    console.error("Failed to fetch admin products:", error);
    return [];
  }
}

// ─── latest published products (homepage / storefront) ───────

export async function getLatestPublishedProducts(limit = 5): Promise<LatestProduct[]> {
  try {
    const data = await apiFetch<{ products: LatestProduct[] }>(
      `/products/latest?limit=${limit}&offset=0`
    );
    return data.products ?? [];
  } catch (error) {
    console.error("Failed to fetch latest products:", error);
    return [];
  }
}

export async function getLatestPublishedProductsPage(
  offset = 0,
  limit = 10
): Promise<{ products: LatestProduct[]; nextOffset: number; total: number }> {
  try {
    const data = await apiFetch<{ products: LatestProduct[]; nextOffset: number; total: number }>(
      `/products/latest?limit=${limit}&offset=${offset}`
    );
    return {
      products:   data.products   ?? [],
      nextOffset: data.nextOffset ?? 0,
      total:      data.total      ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch latest products page:", error);
    return { products: [], nextOffset: 0, total: 0 };
  }
}
