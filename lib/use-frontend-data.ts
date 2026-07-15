"use client";

import { useEffect, useState } from "react";
import type { FrontendData } from "@/lib/frontend-data";
import { cloneDefaultFrontendData } from "@/lib/frontend-data-merge";
import { fetchFrontendData } from "@/lib/frontend-data-store";

export function useFrontendData(initialData?: FrontendData) {
  const [data, setData] = useState<FrontendData>(() => initialData || cloneDefaultFrontendData());
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setIsLoading(false);
      return;
    }

    let active = true;
    const sync = async () => {
      const next = await fetchFrontendData();
      if (active) {
        setData(next);
        setIsLoading(false);
      }
    };
    void sync();
    window.addEventListener("frontend-data:updated", sync);
    return () => {
      active = false;
      window.removeEventListener("frontend-data:updated", sync);
    };
  }, [initialData]);

  return { data, isLoading };
}
