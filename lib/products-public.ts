/**
 * Server-side public product helpers — fetch from the Laravel API.
 */
import { apiFetch } from "@/lib/api";
import type { ProductSpec, RelatedProduct } from "@/lib/frontend-data";

// ─── shared types ─────────────────────────────────────────────

export type PublicProductVariant = {
  id: string;
  label: string;
  price: number;
  priceLabel: string;
  oldPrice?: string;
  stockQty: number;
  sku?: string;
  isDefault: boolean;
};

export type PublicProductGalleryItem = {
  id: string;
  image: string;
  alt: string;
  isVideo?: boolean;
};

export type PublicProductPageData = {
  id: string;
  categoryId?: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  brand?: string;
  currencyCode: string;
  storeName: string;
  storeLabel: string;
  rating: number;
  ratingsLabel: string;
  bestsellerLabel?: string;
  bestsellerCategory?: string;
  boughtLabel?: string;
  shippingLabel: string;
  inStockLabel: string;
  deliveryLabel: string;
  returnsLabel: string;
  paymentLabel: string;
  category?: {
    name: string;
    slug: string;
    parent?: { name: string; slug: string };
  };
  gallery: PublicProductGalleryItem[];
  variants: PublicProductVariant[];
  specs: ProductSpec[];
  aboutItems: string[];
};

export type FeaturedSidebarProduct = {
  id: string;
  title: string;
  image: string;
  href: string;
  rating: number;
  reviews: string;
  currencyCode: string;
  priceWhole: string;
  priceDecimal: string;
  extraPrice?: string;
  shipping: string;
  delivery?: string;
  price: number;
};

export type PublicOfferTargetProduct = {
  id: string;
  slug: string;
  title: string;
  image: string;
  shortDescription: string;
  href: string;
};

export type CategoryListingProduct = {
  id: string;
  name: string;
  slug?: string;
  title?: string;
  brand?: string | null;
  color?: string | null;
  image: string;
  href: string;
  shortDesc: string;
  price: number;
  rating?: number;
  oldPrice?: number;
  discountPercent?: number | null;
  isFeatured?: boolean;
};

// ─── functions ────────────────────────────────────────────────

export async function getPublicProductBySlug(
  slug: string
): Promise<PublicProductPageData | null> {
  try {
    const data = await apiFetch<{ product: PublicProductPageData }>(
      `/products/${encodeURIComponent(slug)}`
    );
    return data.product ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedProductsForProduct(
  productId: string,
  _categoryId?: string | null,
  _limit = 8
): Promise<RelatedProduct[]> {
  try {
    // We look up the slug first from the product list — or pass slug directly.
    // The backend route is /products/{slug}/related.
    // Since we only have the ID here, we'll hit the admin route to get the slug.
    const detail = await apiFetch<{ product: { slug: string } }>(
      `/admin/products/${productId}`
    ).catch(() => null);

    if (!detail?.product?.slug) return [];

    const data = await apiFetch<{ products: RelatedProduct[] }>(
      `/products/${encodeURIComponent(detail.product.slug)}/related`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
}

export async function getFeaturedSidebarProducts(
  limit = 5
): Promise<FeaturedSidebarProduct[]> {
  try {
    const data = await apiFetch<{ products: FeaturedSidebarProduct[] }>(
      `/products/featured`
    );
    return (data.products ?? []).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getOfferTargetProductsBySlugs(
  slugs: string[]
): Promise<PublicOfferTargetProduct[]> {
  const unique = Array.from(new Set(slugs.filter(Boolean)));
  if (!unique.length) return [];

  const params = unique.map((s) => `slugs[]=${encodeURIComponent(s)}`).join("&");

  try {
    const data = await apiFetch<{ products: PublicOfferTargetProduct[] }>(
      `/products/offer-targets?${params}`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
}

export async function searchPublicProducts(
  query: string,
  limit = 12
): Promise<CategoryListingProduct[]> {
  const term = query.trim();
  if (!term) return [];

  try {
    const params = new URLSearchParams({
      q: term,
      limit: String(limit),
    });
    const data = await apiFetch<{ products: CategoryListingProduct[] }>(
      `/products/search?${params.toString()}`
    );
    return data.products ?? [];
  } catch {
    return [];
  }
}

export type SearchCategoryRef = { name: string; slug: string };

export type SearchResults = {
  products: CategoryListingProduct[];
  similarProducts: RelatedProduct[];
  similarCategory: SearchCategoryRef | null;
};

/**
 * Same endpoint as searchPublicProducts, but also surfaces "similar
 * products" from the best-matching category — used by the dedicated
 * /search results page so a query never dead-ends on a handful of exact
 * hits.
 */
export async function searchPublicProductsFull(
  query: string,
  limit = 30
): Promise<SearchResults> {
  const term = query.trim();
  if (!term) return { products: [], similarProducts: [], similarCategory: null };

  try {
    const params = new URLSearchParams({
      q: term,
      limit: String(limit),
    });
    const data = await apiFetch<{
      products?: CategoryListingProduct[];
      similarProducts?: RelatedProduct[];
      similarCategory?: SearchCategoryRef | null;
    }>(`/products/search?${params.toString()}`);
    return {
      products: data.products ?? [],
      similarProducts: data.similarProducts ?? [],
      similarCategory: data.similarCategory ?? null,
    };
  } catch {
    return { products: [], similarProducts: [], similarCategory: null };
  }
}

export type CategorySubCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  products: CategoryListingProduct[];
};

type CategoryListingData = {
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  rootCategory: string;
  products: CategoryListingProduct[];
  subCategories?: CategorySubCategory[];
};

/**
 * Fetch a category page's products in a single request. Laravel resolves
 * exact slug matches, known aliases, and parent/child aggregation
 * server-side (see ProductController::byCategory) — this used to be a
 * frontend-side alias-guessing + N-fetch aggregation, now it's one call.
 */
export async function getProductsByCategorySlug(slug: string, tiles = false) {
  return fetchCategoryListing(slug, tiles);
}

async function fetchCategoryListing(slug: string, tiles = false): Promise<CategoryListingData | null> {
  try {
    const qs = tiles ? "?tiles=1" : "";
    const data = await apiFetch<CategoryListingData>(`/categories/${encodeURIComponent(slug)}/products${qs}`);
    return data;
  } catch {
    return null;
  }
}

export async function getSearchSuggestionsByCategory(
  categoryId: string,
  limit = 8
): Promise<{ id: string; title: string; image: string; href: string }[]> {
  try {
    const data = await apiFetch<{ products: { id: string; name: string; image: string; href: string }[] }>(
      `/categories/by-id/${categoryId}/products`
    );
    return (data.products ?? []).slice(0, limit).map((p) => ({
      id: p.id, title: p.name, image: p.image, href: p.href,
    }));
  } catch {
    return [];
  }
}

export async function getSameCategoryProductsForSearch(
  _productId: string,
  _categoryId?: string | null,
  _limit = 8
): Promise<{ id: string; title: string; image: string; href: string }[]> {
  return [];
}

export async function getFrequentlyViewedProducts(
  productId: string,
  categoryId?: string | null,
  limit = 8
): Promise<RelatedProduct[]> {
  return getRelatedProductsForProduct(productId, categoryId, limit);
}

// ─── home "featured category" cards ───────────────────────────
//
// These populate the cards under the hero (CategoryTilesSection). Backed by
// GET /home/category-groups, which is admin-curated (home_category_groups /
// home_category_group_items in Laravel) and already includes each item's
// products in one response — no per-slug guessing or extra fetches here.

export type HomeCategoryGroupItem = {
  label: string;
  imageUrl: string;
  href: string;
  categorySlug?: string;
  products: CategoryListingProduct[];
};

export type HomeCategoryGroup = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  items: HomeCategoryGroupItem[];
};

export async function getHomeCategoryGroups(): Promise<HomeCategoryGroup[]> {
  try {
    const data = await apiFetch<{ groups: HomeCategoryGroup[] }>(`/home/category-groups`);
    return data.groups ?? [];
  } catch {
    return [];
  }
}

export type FeatureCategory = {
  title: string;
  slug: string;
  products: CategoryListingProduct[];
};

/**
 * Pick the item for a known canonical category slug out of an already-fetched
 * getHomeCategoryGroups() result — call getHomeCategoryGroups() once per page
 * render and reuse it for every card via this helper, rather than fetching
 * per card.
 */
export function pickHomeCategoryFeature(
  groups: HomeCategoryGroup[],
  slug: string,
  fallbackTitle: string
): FeatureCategory | null {
  for (const group of groups) {
    const item = group.items.find((i) => i.categorySlug === slug);
    if (item && item.products.length > 0) {
      return { title: item.label || fallbackTitle, slug, products: item.products };
    }
  }
  return null;
}
