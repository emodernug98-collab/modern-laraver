import type { FrontendData, LatestProduct } from "@/lib/frontend-data";

type CategoryPageData = {
  slug: string;
  title: string;
  description: string;
  image: string;
  rootCategory?: string;
  products: LatestProduct[];
};

function titleizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function getCategoryPageData(
  data: FrontendData,
  slug: string
): CategoryPageData {
  const normalizedSlug = slug.toLowerCase();
  const category = data.categories.find((item) => item.slug === normalizedSlug);
  const tileMatch = data.categoryTiles.cards
    .flatMap((card) =>
      card.tiles.map((tile) => ({
        sectionTitle: card.title,
        ctaHref: card.cta.href,
        tile,
      }))
    )
    .find(({ tile }) => tile.href === `/category/${normalizedSlug}`);
  const sideCardMatch = data.hero.sideCards.find(
    (card) => card.href === `/category/${normalizedSlug}`
  );

  const title =
    category?.title ?? tileMatch?.tile.label ?? sideCardMatch?.title ?? titleizeSlug(slug);
  const description =
    category?.rootCategory
      ? `${title} under ${category.rootCategory}.`
      : tileMatch?.sectionTitle
        ? `${tileMatch.sectionTitle}.`
        : data.hero.slides[1]?.description ??
          "Browse available stock, featured items, and related products in this category.";
  const image =
    category?.banner ||
    category?.thumbnail ||
    tileMatch?.tile.image ||
    sideCardMatch?.image ||
    data.hero.slides[0]?.image ||
    "";

  const searchTerms = new Set<string>([
    normalizedSlug,
    normalize(title),
    ...normalize(title).split(" ").filter((term) => term.length > 2),
  ]);

  const matchedProducts = data.latestProducts.products.filter((product) => {
    const haystack = normalize(
      `${product.name} ${product.shortDesc} ${product.href} ${title}`
    );

    return Array.from(searchTerms).some((term) => haystack.includes(term));
  });

  return {
    slug: normalizedSlug,
    title,
    description,
    image,
    rootCategory: category?.rootCategory,
    products:
      matchedProducts.length > 0
        ? matchedProducts
        : data.latestProducts.products,
  };
}
