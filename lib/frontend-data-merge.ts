import {
  defaultFrontendData,
  type FrontendData,
} from "@/lib/frontend-data";

export function cloneDefaultFrontendData(): FrontendData {
  return JSON.parse(JSON.stringify(defaultFrontendData)) as FrontendData;
}

/**
 * Laravel's GET /frontend-data already returns a complete, fully-merged
 * payload (FrontendDataController::show() merges site_settings over its own
 * defaults before responding), so this only needs to backfill top-level
 * keys that are entirely missing from the response — not deep-merge real
 * content, which used to duplicate business data between here and Laravel.
 */
export function mergeFrontendData(data: unknown): FrontendData {
  if (!data || typeof data !== "object") return cloneDefaultFrontendData();
  return { ...cloneDefaultFrontendData(), ...(data as Partial<FrontendData>) };
}
