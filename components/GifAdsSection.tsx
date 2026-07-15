import type { GifAd } from "@/lib/frontend-data";

export default function GifAdsSection({ ads }: { ads: GifAd[] }) {
  const active = ads.filter((a) => a.isActive && a.image);
  if (active.length === 0) return null;

  return (
    <section className="w-full bg-white py-4">
      <div className="mx-auto w-[98%] px-4">
        <div
          className={[
            "grid gap-3",
            active.length === 1 ? "grid-cols-1" : "grid-cols-2",
            active.length >= 3 ? "lg:grid-cols-3" : "",
            active.length >= 4 ? "xl:grid-cols-4" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {active.map((ad) => (
            <a
              key={ad.id}
              href={ad.href || "#"}
              aria-label={ad.alt || "Ad banner"}
              className="block overflow-hidden rounded-xl"
            >
              {/* Using <img> intentionally — GIFs must not go through Next.js Image optimizer
                  which strips animation frames. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image}
                alt={ad.alt || ""}
                className="h-full w-full object-cover"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
