"use client";

import { useEffect, useState } from "react";

/**
 * Social-proof toast: shows fake "Someone just bought X from Y" popups
 * in the bottom-left corner. Uses random items/customers/locations from
 * the pools below. Picks a new one every ~12-25s after an initial delay.
 */

const ITEMS = [
  "Samsung 55\" 4K Smart TV",
  "LG OLED 65\" TV",
  "Sony Bravia 50\" TV",
  "Hisense 43\" Smart TV",
  "TCL 32\" LED TV",
  "TV Wall Mount Bracket",
  "HDMI Cable 2m",
  "Universal TV Remote",
  "Sound Bar 2.1ch",
  "Bluetooth Speaker",
  "Wireless Headphones",
  "JBL Party Speaker",
  "Home Theater System",
  "Power Surge Protector",
  "TV Stand (Glass)",
  "Smart TV Box (Android)",
  "Satellite Decoder",
  "Antenna (Outdoor HD)",
  "USB Flash Drive 64GB",
  "Subwoofer 1000W",
  "Microphone Wireless",
  "Laptop Charger Universal",
  "LED Backlight Strip",
  "TV Screen Cleaner Kit",
];

const CUSTOMERS = [
  "Brian K.",
  "Sarah N.",
  "Joseph M.",
  "Patricia A.",
  "David O.",
  "Esther W.",
  "Moses T.",
  "Grace L.",
  "Daniel B.",
  "Mariam S.",
  "Henry K.",
  "Joan N.",
  "Peter M.",
  "Rachel A.",
  "Ivan S.",
  "Allan R.",
  "Phiona K.",
  "Tonny W.",
  "Diana M.",
  "Robert O.",
];

const LOCATIONS = [
  "Kampala",
  "Wakiso",
  "Entebbe",
  "Jinja",
  "Mbarara",
  "Gulu",
  "Mukono",
  "Mbale",
  "Masaka",
  "Fort Portal",
  "Lira",
  "Soroti",
  "Arua",
  "Hoima",
  "Kabale",
  "Ntinda",
  "Bugolobi",
  "Bukoto",
  "Nakawa",
  "Kira",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDelay(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

interface Toast {
  id: number;
  customer: string;
  item: string;
  location: string;
  minutesAgo: number;
}

export default function PurchaseNotifications() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    let showTimeout: ReturnType<typeof setTimeout>;
    let hideTimeout: ReturnType<typeof setTimeout>;
    let nextTimeout: ReturnType<typeof setTimeout>;

    const showNext = () => {
      if (!mounted) return;
      const next: Toast = {
        id: Date.now(),
        customer: pick(CUSTOMERS),
        item: pick(ITEMS),
        location: pick(LOCATIONS),
        minutesAgo: Math.floor(Math.random() * 30) + 1,
      };
      setToast(next);
      // mount → next tick → show (for transition)
      showTimeout = setTimeout(() => {
        if (mounted) setVisible(true);
      }, 50);
      // visible for ~6s
      hideTimeout = setTimeout(() => {
        if (mounted) setVisible(false);
      }, 6500);
      // schedule next one 12-25s after this one starts
      nextTimeout = setTimeout(showNext, randomDelay(12000, 25000));
    };

    // Initial delay before first toast (~5s)
    const initial = setTimeout(showNext, 5000);

    return () => {
      mounted = false;
      clearTimeout(initial);
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-[60] max-w-xs sm:max-w-sm transform transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-start gap-3 rounded-lg bg-white shadow-lg ring-1 ring-black/10 p-3 pr-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-900 leading-snug">
            <span className="font-semibold">{toast.customer}</span>
            <span className="text-gray-600"> from </span>
            <span className="font-medium">{toast.location}</span>
            <span className="text-gray-600"> just bought</span>
          </p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">
            {toast.item}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {toast.minutesAgo} {toast.minutesAgo === 1 ? "minute" : "minutes"} ago
            <span className="mx-1.5">·</span>
            <span className="inline-flex items-center gap-1 text-green-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              verified
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
