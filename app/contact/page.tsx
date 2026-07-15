import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ContactClient from "./ContactClient";
import { readFrontendData } from "@/lib/site-settings";
import { mergeFrontendData } from "@/lib/frontend-data-merge";
import { API_URL } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Modern Electronics",
  description: "Get in touch with Modern Electronics. We are here to help.",
};

type ContactPageData = {
  hero_title: string;
  hero_subtitle: string;
  address: string;
  phone: string;
  email: string;
  map_embed_url: string;
  working_hours: string;
  social_links: { platform: string; url: string }[];
};

const defaults: ContactPageData = {
  hero_title: "Get in Touch",
  hero_subtitle: "We are here to help. Reach out to us through any of the channels below.",
  address: "Kampala, Uganda",
  phone: "+256 700 000 000",
  email: "info@e-modern.ug",
  map_embed_url: "",
  working_hours: "Mon – Sat: 8 AM – 6 PM",
  social_links: [],
};

async function getContactPageData(): Promise<ContactPageData> {
  try {
    const res = await fetch(`${API_URL}/pages/contact`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return defaults;
    const json = (await res.json()) as { data?: Partial<ContactPageData> };
    return { ...defaults, ...(json.data ?? {}) };
  } catch {
    return defaults;
  }
}

export default async function ContactPage() {
  const [frontendData, contactData] = await Promise.all([
    readFrontendData().then((d) => d ?? mergeFrontendData({})),
    getContactPageData(),
  ]);

  return (
    <>
      <NavBar initialData={frontendData} />
      <ContactClient data={contactData} />
      <Footer />
    </>
  );
}
