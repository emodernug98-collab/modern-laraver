import type { Metadata } from "next";
import "./globals.css";
import DeferredOverlays from "@/components/DeferredOverlays";
import MobileAppControls from "@/components/MobileAppControls";

import { readFrontendData } from "@/lib/site-settings";
import { mergeFrontendData } from "@/lib/frontend-data-merge";
import { IMAGE_CDN_ORIGIN, HAS_IMAGE_CDN } from "@/lib/media";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  GEO,
  absoluteUrl,
  jsonLdString,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const frontendData = await readFrontendData().catch(() => null);
  const data = mergeFrontendData(frontendData ?? {});
  const nav = data.navbar;

  const siteTitle = nav.siteTitle || SITE_NAME;
  const description = DEFAULT_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${siteTitle}`,
    },
    description,
    keywords: DEFAULT_KEYWORDS,
    applicationName: siteTitle,
    authors: [{ name: siteTitle }],
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
    },
    icons: {
      icon: nav.faviconUrl || "/favicon.png",
      shortcut: nav.faviconUrl || "/favicon.png",
      apple: nav.faviconUrl || "/favicon.png",
    },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      siteName: siteTitle,
      title: DEFAULT_TITLE,
      description,
      url: SITE_URL,
      locale: GEO.locale,
      countryName: GEO.country,
      images: [
        {
          url: absoluteUrl(DEFAULT_OG_IMAGE),
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description,
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "shopping",
    other: {
      "geo.region": GEO.region,
      "geo.placename": GEO.placename,
      "geo.position": GEO.position,
      ICBM: GEO.position.replace(";", ", "),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const frontendData = await readFrontendData().catch(() => null);
  const data = mergeFrontendData(frontendData ?? {});
  const nav = data.navbar;
  const siteTitle = nav.siteTitle || SITE_NAME;

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: siteTitle,
    alternateName: ["Modern Electronics Uganda", "e-modern"],
    url: SITE_URL,
    logo: nav.logoUrl ? absoluteUrl(nav.logoUrl) : absoluteUrl("/favicon.png"),
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "UG",
      addressRegion: "Central Region",
      addressLocality: "Kampala",
    },
    areaServed: [
      { "@type": "Country", name: "Uganda" },
      { "@type": "City", name: "Kampala" },
      { "@type": "City", name: "Wakiso" },
      { "@type": "City", name: "Entebbe" },
      { "@type": "City", name: "Jinja" },
      { "@type": "City", name: "Mbarara" },
    ],
    currenciesAccepted: "UGX",
    paymentAccepted: ["Cash on Delivery", "Mobile Money", "Card"],
    sameAs: [] as string[],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        {/*
          Preconnect to third-party asset/embed origins before they are
          requested. The browser opens DNS + TLS up-front, so the first
          image GET reuses an already-warm connection.

          The image CDN tag is conditional: it's only emitted when
          NEXT_PUBLIC_IMAGE_CDN_URL is set. Without it, images fall back
          to the in-app /api/media proxy and the preconnect would be
          wasted.
        */}
        {HAS_IMAGE_CDN && IMAGE_CDN_ORIGIN ? (
          <>
            <link rel="preconnect" href={IMAGE_CDN_ORIGIN} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={IMAGE_CDN_ORIGIN} />
          </>
        ) : null}
        <link rel="preconnect" href="https://admin.e-modern.ug" />
        <link rel="dns-prefetch" href="https://admin.e-modern.ug" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://maps.google.com" />
        <link rel="dns-prefetch" href="https://maps.google.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" />
        <link rel="dns-prefetch" href="https://maps.gstatic.com" />
      </head>
      <body className="antialiased">
        {children}
        <DeferredOverlays />
        <MobileAppControls />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(websiteLd) }}
        />
      </body>
    </html>
  );
}
