/**
 * Shared SEO helpers.
 *
 * SITE_URL is read from NEXT_PUBLIC_SITE_URL at build/runtime. It should be
 * the canonical public origin (no trailing slash), e.g. "https://e-modern.ug".
 *
 * Keyword strategy (based on competitor research — Jumia.ug, Jiji.ug,
 * Amazon.com):
 *  - Location triplets (category + Uganda + city) win long-tail traffic.
 *  - Intent verbs (buy, shop, order) drive commercial-intent CTR.
 *  - Brand × category pairs (Samsung TV, iPhone Uganda) rank fast.
 *  - Transactional qualifiers (free delivery, pay on delivery, best prices)
 *    match Ugandan shopper queries.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://e-modern.ug"
).replace(/\/$/, "");

export const SITE_NAME = "Modern Electronics";

export const DEFAULT_TITLE =
  "Modern Electronics Uganda — Buy Electronics, TVs, Phones & Appliances Online | Free Delivery";

export const DEFAULT_DESCRIPTION =
  "Shop electronics, TVs, smartphones, laptops, fridges, washing machines & home appliances online in Uganda. Genuine products, best prices in UGX, pay on delivery, fast delivery in Kampala, Wakiso, Entebbe, Jinja & Mbarara.";

/**
 * Core site-wide keyword set. Targets:
 *  - Brand search ("Modern Electronics", "e-modern")
 *  - Category + Uganda (high intent)
 *  - City-level long-tail (Kampala, Wakiso, Entebbe, Jinja, Mbarara, Gulu)
 *  - Brand × product (Samsung TV, iPhone, LG fridge, Hisense)
 *  - Transactional qualifiers (buy, online, cheap, pay on delivery)
 */
export const DEFAULT_KEYWORDS = [
  // Brand
  "Modern Electronics",
  "Modern Electronics Uganda",
  "e-modern",
  "e-modern.ug",

  // Core commercial intent
  "online shopping Uganda",
  "buy electronics online Uganda",
  "electronics store Uganda",
  "online electronics shop Uganda",
  "Uganda online store",
  "shop online Uganda",
  "cheap electronics Uganda",
  "best electronics prices Uganda",

  // Cities / regions
  "electronics Kampala",
  "electronics shop Kampala",
  "electronics Wakiso",
  "electronics Entebbe",
  "electronics Jinja",
  "electronics Mbarara",
  "electronics Gulu",
  "East Africa electronics",

  // Core categories
  "TVs Uganda",
  "smart TV Uganda",
  "televisions Kampala",
  "phones Uganda",
  "smartphones Uganda",
  "mobile phones Kampala",
  "laptops Uganda",
  "computers Uganda",
  "home appliances Uganda",
  "kitchen appliances Uganda",
  "refrigerators Uganda",
  "fridges Kampala",
  "washing machines Uganda",
  "microwaves Uganda",
  "cookers Uganda",
  "air conditioners Uganda",
  "sound systems Uganda",
  "speakers Uganda",
  "headphones Uganda",
  "accessories Uganda",

  // Spare parts / repair niche
  "TV spare parts Uganda",
  "T-CON boards Uganda",
  "main boards Uganda",
  "appliance spare parts Kampala",

  // Top brands (Uganda market)
  "Samsung Uganda",
  "LG Uganda",
  "Hisense Uganda",
  "TCL Uganda",
  "Sony Uganda",
  "Apple Uganda",
  "iPhone Uganda",
  "Tecno Uganda",
  "Infinix Uganda",
  "Itel Uganda",
  "Nokia Uganda",
  "HP laptops Uganda",
  "Dell Uganda",
  "Lenovo Uganda",

  // Service / trust
  "pay on delivery Uganda",
  "free delivery Kampala",
  "fast delivery Uganda",
  "genuine electronics Uganda",
  "warranty electronics Uganda",

  // Deal-intent
  "electronics deals Uganda",
  "discount electronics Kampala",
  "electronics offers Uganda",
  "hot deals Uganda",
];

/**
 * A default OpenGraph image hosted in /public. Replace with a 1200×630 branded
 * image showing the logo + tagline for better social-share CTR.
 */
export const DEFAULT_OG_IMAGE = "/og-image.png";

/** Canonical geographic coverage — used in Metadata.other + JSON-LD. */
export const GEO = {
  region: "UG",
  placename: "Kampala",
  position: "0.3476;32.5825",
  country: "Uganda",
  currency: "UGX",
  locale: "en_UG",
} as const;

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Build a keyword list for a category page by crossing the category name
 * with high-intent qualifiers and Ugandan cities.
 */
export function buildCategoryKeywords(
  categoryTitle: string,
  rootCategory?: string
): string[] {
  const base = categoryTitle.trim();
  if (!base) return DEFAULT_KEYWORDS.slice(0, 20);

  const cities = ["Uganda", "Kampala", "Wakiso", "Entebbe", "Jinja", "Mbarara"];
  const intents = [
    `buy ${base} online`,
    `${base} price in Uganda`,
    `cheap ${base} Uganda`,
    `best ${base} Uganda`,
    `${base} for sale Uganda`,
    `order ${base} online`,
    `${base} deals`,
    `${base} offers`,
  ];
  const geo = cities.map((c) => `${base} in ${c}`);

  const keywords = new Set<string>([
    base,
    `${base} Uganda`,
    `${base} Kampala`,
    ...geo,
    ...intents,
    rootCategory ? `${rootCategory} Uganda` : "",
    "Modern Electronics Uganda",
    "online shopping Uganda",
    "pay on delivery Uganda",
    "free delivery Kampala",
  ]);
  keywords.delete("");
  return Array.from(keywords);
}

/**
 * Build keywords for a product page combining product name, brand, category,
 * and transactional qualifiers.
 */
export function buildProductKeywords(opts: {
  name: string;
  brand?: string;
  category?: string;
  parentCategory?: string;
}): string[] {
  const { name, brand, category, parentCategory } = opts;
  const base = name.trim();
  const kw = new Set<string>();
  if (base) {
    kw.add(base);
    kw.add(`${base} Uganda`);
    kw.add(`${base} Kampala`);
    kw.add(`${base} price in Uganda`);
    kw.add(`buy ${base} online`);
    kw.add(`${base} for sale Uganda`);
    kw.add(`cheap ${base} Uganda`);
  }
  if (brand) {
    kw.add(brand);
    kw.add(`${brand} Uganda`);
    kw.add(`${brand} ${category ?? ""} Uganda`.replace(/\s+/g, " ").trim());
  }
  if (category) {
    kw.add(category);
    kw.add(`${category} Uganda`);
    kw.add(`${category} Kampala`);
    kw.add(`buy ${category} online`);
  }
  if (parentCategory) {
    kw.add(`${parentCategory} Uganda`);
  }
  kw.add("pay on delivery Uganda");
  kw.add("free delivery Kampala");
  kw.add("Modern Electronics Uganda");
  return Array.from(kw);
}

/**
 * Minimal JSON-LD serializer — emits a valid application/ld+json string and
 * escapes `<` to avoid breaking out of the script tag.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
