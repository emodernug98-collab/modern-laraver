import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CategoryProductsClient from "@/components/CategoryProductsClient";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import { readFrontendData } from "@/lib/site-settings";
import { mergeFrontendData } from "@/lib/frontend-data-merge";
import { searchPublicProductsFull } from "@/lib/products-public";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const term = ((await searchParams)?.q ?? "").trim();
  return {
    title: term ? `Search results for "${term}"` : "Search",
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const term = ((await searchParams)?.q ?? "").trim();
  const [results, frontendData] = await Promise.all([
    searchPublicProductsFull(term, 40),
    readFrontendData().then((d) => d ?? mergeFrontendData({})),
  ]);

  return (
    <>
      <NavBar initialData={frontendData} />
      <main className="min-h-screen bg-[#f7f7f7]">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-2 py-5 sm:w-[98%] sm:px-4 sm:py-8">
            <h1 className="text-[22px] font-bold tracking-tight text-gray-900 sm:text-[34px]">
              {term ? `Search results for "${term}"` : "Search"}
            </h1>
            <p className="mt-2 text-[13px] text-gray-600 sm:text-[15px]">
              {term === ""
                ? "Type something into the search bar above."
                : results.products.length > 0
                  ? `${results.products.length} product${results.products.length === 1 ? "" : "s"} found`
                  : "No products matched your search."}
            </p>
          </div>
        </section>

        {term !== "" ? (
          <CategoryProductsClient
            categoryTitle={`"${term}"`}
            categorySlug="search"
            searchTerm={term}
            products={results.products}
          />
        ) : null}

        {results.similarProducts.length > 0 ? (
          <RelatedProductsCarousel
            products={results.similarProducts}
            title={
              results.similarCategory
                ? `More from ${results.similarCategory.name}`
                : "You might also like"
            }
            sponsoredLabel={null}
            pageLabel={null}
          />
        ) : null}
      </main>
      <Footer />
    </>
  );
}
