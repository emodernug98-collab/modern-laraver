"use client";

import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Music2,
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
} from "lucide-react";
import { useFrontendData } from "@/lib/use-frontend-data";
import SafeImage from "@/components/SafeImage";
import { PaymentBrand } from "@/components/PaymentIcon";
import type { FrontendData } from "@/lib/frontend-data";

const helpLinks = [
  { label: "Chat with us", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Contact us", href: "/contact" },
];

const usefulLinks = [
  "Place an order",
  "Pay for your order",
  "Shipping & Delivery",
  "Pickup Stations",
  "Report a Product",
  "Create a return",
];

const aboutLinks = [
  { label: "About Modern Electronics", href: "/about" },
  { label: "Our Stores", href: "/contact" },
  { label: "Careers", href: "#" },
  { label: "Warranty Policy", href: "#" },
  { label: "Terms and Conditions", href: "#" },
  { label: "Store Credit Terms & Conditions", href: "#" },
  { label: "Dispute Resolution Policy", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Cookie Notice", href: "#" },
  { label: "Return & Refund Policy", href: "#" },
  { label: "Deals & Flash Sales", href: "#" },
];

const businessLinks = [
  "Sell on Modern Electronics",
  "Vendor Hub",
  "Become a Sales Consultant",
  "Modern Electronics B2B",
  "Become a Pickup Station Partner",
];

const socials = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Music2, label: "TikTok" },
];

export default function ModernElectronicsFooter({ initialData }: { initialData?: FrontendData }) {
  const { data } = useFrontendData(initialData);
  const brands = Array.isArray(data?.brands) ? data.brands : [];
  const gateways = Array.isArray(data?.gateways)
    ? data.gateways.filter((gateway) => gateway.enabled)
    : [];

  // Group brands into columns of 5
  const columns: string[][] = [];
  for (let i = 0; i < brands.length; i += 5) {
    columns.push(brands.slice(i, i + 5).map(b => b.title));
  }

  return (
    <footer className="bg-[#111827] border-t border-white/5 text-white">
      <div className="mx-auto w-[98%] px-6 py-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-8 sm:flex-row lg:gap-12">
            <FooterBlock title="Need Help?">
              {helpLinks.map((item) => (
                <FooterLink key={item.label} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </FooterBlock>

            <FooterBlock title="Useful Links">
              {usefulLinks.map((item) => (
                <FooterLink key={item} href="#">
                  {item}
                </FooterLink>
              ))}
            </FooterBlock>
          </div>

          <FooterBlock title="About Modern Electronics">
            {aboutLinks.map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterBlock>

          <FooterBlock title="Make Money With Us">
            {businessLinks.map((item) => (
              <FooterLink key={item} href="#">
                {item}
              </FooterLink>
            ))}
          </FooterBlock>
        </div>

        <div className="mt-8 grid gap-8 border-t border-gray-800 pt-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-[13px] font-black uppercase tracking-wider text-[#f6c400]">
              Follow Us
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-700 bg-gray-800/40 text-white transition-all hover:border-[#f6c400] hover:bg-[#f6c400] hover:text-black shadow-lg"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[13px] font-black uppercase tracking-wider text-[#f6c400]">
              Supported Payments
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {gateways.map((gateway) => (
                <div
                  key={gateway.id}
                  title={gateway.name}
                  className="flex h-9 min-w-[56px] items-center justify-center rounded-md bg-white px-2.5 shadow-sm"
                >
                  {gateway.logo ? (
                    <SafeImage
                      src={gateway.logo}
                      alt={gateway.name}
                      width={72}
                      height={24}
                      sizes="72px"
                      className="h-6 w-auto max-w-[72px] object-contain"
                    />
                  ) : (
                    <PaymentBrand name={gateway.name} />
                  )}
                  <span className="sr-only">{gateway.name}</span>
                </div>
              ))}

              {gateways.length === 0 ? (
                <span className="inline-flex h-10 items-center rounded-lg border border-gray-700 bg-gray-800/20 px-4 text-[13px] font-bold text-gray-200">
                  Payment methods coming soon
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {brands.length > 0 && (
          <div className="mt-8 border-t border-gray-800 pt-8">
            <h3 className="mb-6 text-[13px] font-black uppercase tracking-wider text-[#f6c400]">
                Our Active Brands
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {columns.map((column, index) => (
                <div key={index} className="space-y-2">
                  {column.map((brand) => (
                    <a
                      key={brand}
                      href={`/brands/${brand.toLowerCase().replace(/ /g, "-")}`}
                      className="block text-[13px] font-medium text-gray-400 transition hover:text-[#f6c400] hover:translate-x-1"
                    >
                      {brand}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row">
            <p className="text-[13px] font-medium text-gray-500">
              © {new Date().getFullYear()} Modern Electronics Ltd. Built for the future of commerce.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#f6c400]" />
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#f6c400]" />
                Express Delivery
              </span>
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#f6c400]" />
                Genuine Goods
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h3 className="mb-4 text-[13px] font-black uppercase tracking-wider text-[#f6c400]">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-[13px] font-medium text-gray-400 transition hover:text-[#f6c400] hover:translate-x-1 inline-block"
    >
      {children}
    </a>
  );
}
