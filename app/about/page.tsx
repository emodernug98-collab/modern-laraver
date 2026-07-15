import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AboutClient from "./AboutClient";
import { readFrontendData } from "@/lib/site-settings";
import { mergeFrontendData } from "@/lib/frontend-data-merge";
import { API_URL } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Modern Electronics",
  description:
    "Learn about Modern Electronics — our mission, vision, and the team behind Uganda's trusted electronics retailer.",
};

export type TeamMember = {
  name: string;
  role: string;
  avatar: string;
};

export type AboutData = {
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  mission_title: string;
  mission_body: string;
  vision_title: string;
  vision_body: string;
  team_heading: string;
  team_members: TeamMember[];
};

const defaults: AboutData = {
  hero_title: "About Modern Electronics",
  hero_subtitle: "Your trusted destination for quality electronics and accessories.",
  hero_image: "",
  mission_title: "Our Mission",
  mission_body:
    "To provide customers across Uganda with high-quality electronics at fair prices, backed by excellent service.",
  vision_title: "Our Vision",
  vision_body:
    "To become the most trusted electronics retailer in East Africa.",
  team_heading: "Meet the Team",
  team_members: [],
};

async function getAboutData(): Promise<AboutData> {
  try {
    const res = await fetch(`${API_URL}/pages/about`, { next: { revalidate: 300 } });
    if (!res.ok) return defaults;
    const json = (await res.json()) as { data?: Partial<AboutData> };
    return { ...defaults, ...(json.data ?? {}) };
  } catch {
    return defaults;
  }
}

export default async function AboutPage() {
  const [frontendData, aboutData] = await Promise.all([
    readFrontendData().then((d) => d ?? mergeFrontendData({})),
    getAboutData(),
  ]);

  return (
    <>
      <NavBar initialData={frontendData} />
      <AboutClient data={aboutData} />
      <Footer />
    </>
  );
}
