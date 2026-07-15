"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

export default function AuthRouteOverlayEntry({
  mode,
}: {
  mode: "login" | "register";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/user";

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace(redirect);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("auth:modal-open", {
        detail: {
          mode,
          redirect,
        },
      })
    );

    const handleClose = () => {
      if (!isLoggedIn()) {
        router.replace("/");
      }
    };

    const handleAuthUpdate = () => {
      if (isLoggedIn()) {
        router.replace(redirect);
      }
    };

    window.addEventListener("auth:modal-close", handleClose);
    window.addEventListener("auth:updated", handleAuthUpdate);

    return () => {
      window.removeEventListener("auth:modal-close", handleClose);
      window.removeEventListener("auth:updated", handleAuthUpdate);
    };
  }, [mode, redirect, router]);

  return <div className="min-h-screen bg-[#eaeded]" />;
}
