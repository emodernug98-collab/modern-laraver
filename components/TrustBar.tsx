"use client";

import { Wallet, Package, Truck } from "lucide-react";
import { useFrontendData } from "@/lib/use-frontend-data";
import type { FrontendData } from "@/lib/frontend-data";

export default function TrustBar({ initialData }: { initialData?: FrontendData }) {
  const { data } = useFrontendData(initialData);
  const items = data.trustBar.items;

  return (
    <section className="w-full bg-white py-6">
      <div className="mx-auto w-[98%] bg-[#114f8f] px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ff6a00]/40">
                <div className="text-white">
                  {item.icon === "wallet" ? <Wallet size={40} /> : null}
                  {item.icon === "package" ? <Package size={40} /> : null}
                  {item.icon === "truck" ? <Truck size={40} /> : null}
                </div>
              </div>

              <div className="leading-tight">
                <h3 className="font-display text-[22px] font-bold text-white">{item.title}</h3>
                <p className="text-[16px] text-white/60">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
