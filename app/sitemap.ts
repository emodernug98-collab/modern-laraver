import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getLatestPublishedProductsPage } from "@/lib/products-admin";
import { readFrontendData } from "@/lib/site-settings";
import { mergeFrontendData } from "@/lib/frontend-data-merge";

export const revalidate = 3600; // regenerate at most once per hour

const STATIC_PATHS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/cart", changeFrequency: "weekly", priority: 0.3 },
  { path: "/wishlist", changeFrequency: "weekly", priority: 0.3 },
];

async function collectAllProducts(): Promise<
  { slug: string; updatedAt?: string }[]
> {
  const all: { slug: string; updatedAt?: string }[] = [];
  const pageSize = 100;
  const maxPages = 50; // hard safety cap (=5000 products)
  let offset = 0;

  for (let i = 0; i < maxPages; i++) {
    const { products, nextOffset, total } =
      await getLatestPublishedProductsPage(offset, pageSize);

    for (const p of products) {
      // `LatestProduct.href` is "/product/<slug>" — derive slug portion.
      const slug = (p.href ?? "")
        .replace(/^\/product\//, "")
        .replace(/^\//, "");
      if (slug) all.push({ slug });
    }

    if (!products.length || all.length >= total || nextOffset === offset) break;
    offset = nextOffset;
  }

  // De-duplicate by slug
  const seen = new Set<string>();
  return all.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [frontendDataRaw, products] = await Promise.all([
    readFrontendData().catch(() => null),
    collectAllProducts().catch(() => []),
  ]);

  const frontendData = frontendDataRaw ?? mergeFrontendData({});
  const categories = (frontendData.categories ?? []).filter(
    (c) => c.isActive !== false && c.slug
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((s) => ({
    url: `${SITE_URL}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
