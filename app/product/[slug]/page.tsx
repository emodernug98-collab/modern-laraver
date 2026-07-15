import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import PreviouslyBrowsedProductsRow from "@/components/PreviouslyBrowsedProductsRow";
import Footer from "@/components/Footer";
import {
  getFeaturedSidebarProducts,
  getPublicProductBySlug,
  getRelatedProductsForProduct,
  getSameCategoryProductsForSearch,
} from "@/lib/products-public";
import type { RelatedProduct } from "@/lib/frontend-data";
import { readFrontendData } from "@/lib/site-settings";
import { mergeFrontendData } from "@/lib/frontend-data-merge";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildProductKeywords,
  jsonLdString,
} from "@/lib/seo";

function stripHtml(input: string | undefined | null, max = 160): string {
  if (!input) return "";
  const text = input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    };
  }

  const brandPart = product.brand ? `${product.brand} ` : "";
  const title = `Buy ${brandPart}${product.name} in Uganda — Best Price, Free Delivery Kampala`;
  const description =
    stripHtml(product.shortDescription) ||
    stripHtml(product.description) ||
    `Buy ${product.name} online in Uganda at ${SITE_NAME}. Genuine products in UGX, pay on delivery, fast delivery in Kampala, Wakiso, Entebbe, Jinja & Mbarara.`;

  const image = product.gallery?.[0]?.image;
  const canonical = `/product/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    keywords: buildProductKeywords({
      name: product.name,
      brand: product.brand,
      category: product.category?.name,
      parentCategory: product.category?.parent?.name,
    }),
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [frontendDataRaw, relatedProducts, featuredProductsRaw, searchSuggestions] = await Promise.all([
    readFrontendData().catch(() => null),
    getRelatedProductsForProduct(product.id, product.categoryId),
    getFeaturedSidebarProducts(10),
    getSameCategoryProductsForSearch(product.id, product.categoryId),
  ]);

  const frontendData = frontendDataRaw ?? mergeFrontendData({});

  const relatedPreview = relatedProducts[0]
    ? {
        title: relatedProducts[0].title,
        image: relatedProducts[0].image,
        href: relatedProducts[0].href,
        price: relatedProducts[0].price ?? "",
      }
    : undefined;
  const featuredProducts: RelatedProduct[] = featuredProductsRaw
    .filter((item) => item.id !== product.id)
    .map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      href: item.href,
      rating: item.rating,
      reviews: item.reviews,
      price: `${item.currencyCode} ${item.priceWhole}${item.priceDecimal}`,
    }));

  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const productImage = product.gallery?.[0]?.image;

  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      stripHtml(product.description, 5000) ||
      stripHtml(product.shortDescription, 5000),
    sku: defaultVariant?.sku || product.id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    image: productImage ? [productImage] : undefined,
    url: productUrl,
    category: product.category?.name,
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: 1,
        }
      : undefined,
    offers: defaultVariant
      ? {
          "@type": "Offer",
          priceCurrency: product.currencyCode || "UGX",
          price: defaultVariant.price,
          availability:
            defaultVariant.stockQty > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: productUrl,
        }
      : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      product.category
        ? {
            "@type": "ListItem",
            position: 2,
            name: product.category.name,
            item: absoluteUrl(`/category/${product.category.slug}`),
          }
        : null,
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.name,
        item: productUrl,
      },
    ].filter(Boolean),
  };

  return (
    <>
      <NavBar
        searchSuggestions={searchSuggestions}
        searchContextLabel={product.category?.name}
        initialData={frontendData}
      />
      <ProductDetailsClient
        product={product}
        relatedPreview={relatedPreview}
      />
      <RelatedProductsCarousel
        products={featuredProducts}
        title="Featured products"
        sponsoredLabel={null}
        pageLabel={null}
      />
      <RelatedProductsCarousel
        products={relatedProducts}
        title="Frequently bought with"
        sponsoredLabel={null}
        pageLabel={relatedProducts.length > 0 ? "Page 1 of 1" : null}
      />
      <PreviouslyBrowsedProductsRow
        currentProductId={product.id}
      />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbLd) }}
      />
    </>
  );
}
