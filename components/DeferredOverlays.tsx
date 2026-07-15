"use client";

import AuthOverlay from "@/components/AuthOverlay";
import MiniCart from "@/components/MiniCart";
import PurchaseNotifications from "@/components/PurchaseNotifications";

export default function DeferredOverlays() {
  return (
    <>
      <MiniCart />
      <AuthOverlay />
      <PurchaseNotifications />
    </>
  );
}
