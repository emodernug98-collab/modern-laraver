import type { Metadata } from "next";
import { mergeFrontendData } from "@/lib/frontend-data-merge";
import { readFrontendData } from "@/lib/site-settings";
import NavBar from "@/components/NavBar";
import HeroCarouselWithRightCards from "@/components/HeroCarouselWithRightCards";
import TrustBar from "@/components/TrustBar";
import CategoryTilesSection from "@/components/CategoryTilesSection";
import LatestProductsSection from "@/components/LatestProductsSection";
import Footer from "@/components/Footer";
import type { GifAd } from "@/lib/frontend-data";
import { getLatestPublishedProducts } from "@/lib/products-admin";
import { getHomeCategoryGroups, pickHomeCategoryFeature } from "@/lib/products-public";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  // Home page stays on the site-wide default title so Google shows the full
  // keyword-rich branded title for navigational queries.
  const title = DEFAULT_TITLE;
  const description = DEFAULT_DESCRIPTION;

  return {
    title,
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
  };
}

export default async function Home() {
  const frontendData =
    (await readFrontendData().catch(() => null)) ?? mergeFrontendData({});
  const [latestProductsResult, homeCategoryGroupsResult] = await Promise.allSettled([
    getLatestPublishedProducts(10),
    getHomeCategoryGroups(),
  ]);
  const latestProducts = latestProductsResult.status === "fulfilled" ? latestProductsResult.value : [];
  const homeCategoryGroups =
    homeCategoryGroupsResult.status === "fulfilled" ? homeCategoryGroupsResult.value : [];
  const sparePartsCategory = pickHomeCategoryFeature(homeCategoryGroups, "spare-parts", "Spare parts and Components");
  const applianceCategory = pickHomeCategoryFeature(homeCategoryGroups, "home-appliances", "Home Appliances");
  const arduinoCategory = pickHomeCategoryFeature(homeCategoryGroups, "arduino-kits", "Arduino Kits");
  const batteriesCategory = pickHomeCategoryFeature(homeCategoryGroups, "accessories", "Accessories");
  const latestSection = frontendData.latestProducts;
  const products = latestProducts.length > 0 ? latestProducts : latestSection.products;

  const productSuggestions = latestProducts.map(p => ({
    id: p.id,
    title: p.name,
    image: p.image,
    href: p.href,
    slug: p.href.split("?")[0].split("/").filter(Boolean).pop() || "",
  }));

  const gifAds = (frontendData.gifAds ?? []).filter((a: GifAd) => a.isActive && a.image);

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      <NavBar searchSuggestions={productSuggestions} initialData={frontendData} />
      <div className="mx-auto grid w-full max-w-[1860px] grid-cols-1 gap-0 px-0 sm:gap-4 sm:px-3 xl:grid-cols-[144px_minmax(0,1fr)_144px] 2xl:grid-cols-[220px_minmax(0,1fr)_220px]">
        <HomeAdRail side="left" ads={gifAds} />
        <div className="min-w-0 bg-white">
          <HeroCarouselWithRightCards initialData={frontendData} />
          <TrustBar initialData={frontendData} />
          <CategoryTilesSection
            initialData={frontendData}
            arduinoFeature={
              arduinoCategory
                ? {
                    title: arduinoCategory.title,
                    href: `/category/${arduinoCategory.slug}`,
                    products: arduinoCategory.products.map((p) => ({
                      id: p.id,
                      name: p.name,
                      image: p.image,
                      href: p.href,
                    })),
                  }
                : undefined
            }
            batteriesFeature={
              batteriesCategory
                ? {
                    title: batteriesCategory.title,
                    href: `/category/accessories`,
                    products: batteriesCategory.products.map((p) => ({
                      id: p.id,
                      name: p.name,
                      image: p.image,
                      href: p.href,
                    })),
                  }
                : undefined
            }
            sparePartsFeature={
              sparePartsCategory
                ? {
                    title: sparePartsCategory.title,
                    href: `/category/${sparePartsCategory.slug}`,
                    products: sparePartsCategory.products.map((product) => ({
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      href: product.href,
                    })),
                    featuredProducts: sparePartsCategory.products
                      .filter((product) => product.isFeatured)
                      .map((product) => ({
                        id: product.id,
                        name: product.name,
                        image: product.image,
                        href: product.href,
                      })),
                  }
                : undefined
            }
            applianceFeature={
              applianceCategory
                ? {
                    title: applianceCategory.title,
                    href: `/category/${applianceCategory.slug}`,
                    products: applianceCategory.products.map((product) => ({
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      href: product.href,
                    })),
                  }
                : undefined
            }
          />
          <LatestProductsSection
            title={latestSection.title}
            ctaHref={latestSection.ctaHref}
            ctaLabel={latestSection.ctaLabel}
            products={products}
          />
        </div>
        <HomeAdRail side="right" ads={frontendData.gifAds ?? []} />
      </div>
      <Footer initialData={frontendData} />
    </main>
  );
}

/**
 * Side-rail GIF ad banners (xl viewport and up).
 *
 * Data source: Dashboard → StoreFront → GIF Ads
 * Persisted in site_settings.frontend_data.gifAds, served via
 * /api/frontend-data, typed as GifAd[].
 *
 * Uses SafeImage so banners route through the configured image CDN
 * when one is set, and lazy-load below the fold. Banners without an
 * href render as a plain <div> instead of a dead "#" link.
 */
function HomeAdRail({ side, ads }: { side: "left" | "right"; ads: GifAd[] }) {
  return (
    <aside
      aria-label={`${side} GIF ad rail`}
      className="sticky top-4 hidden self-start py-6 xl:block"
    >
      <div className="space-y-4">
        {ads.length === 0 ? (
          <div className="flex h-[1100px] w-full items-center justify-center border border-dashed border-gray-300 bg-white/75 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Ad
          </div>
        ) : (
          ads.map((ad) => {
            const banner = (
              <div className="overflow-hidden border border-gray-200 bg-white">
                <SafeImage
                  src={ad.image}
                  alt={ad.alt || "Promotional banner"}
                  width={220}
                  height={1100}
                  sizes="(min-width:1536px) 220px, 144px"
                  className="h-auto w-full object-contain"
                />
              </div>
            );

            return ad.href ? (
              <Link
                key={ad.id}
                href={ad.href}
                aria-label={ad.alt || "Promotional banner"}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#114f8f]"
              >
                {banner}
              </Link>
            ) : (
              <div key={ad.id}>{banner}</div>
            );
          })
        )}
      </div>
    </aside>
  );
}
