import {
  defaultFrontendData,
  type FrontendData,
} from "@/lib/frontend-data";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  // If base is a list of configuration objects (like gateways or slides), 
  // we want to merge them by ID if possible, or replace the whole list if not.
  if (Array.isArray(base)) {
    const overrideArr = Array.isArray(override) ? override : [];
    if (overrideArr.length === 0) return base;
    
    // If they look like configuration items with an 'id', we can do a smart merge
    // but usually for config arrays, replacing the whole array is the intended behavior
    return overrideArr as unknown as T;
  }

  if (isRecord(base) && isRecord(override)) {
    const result: JsonRecord = { ...base };
    for (const [key, value] of Object.entries(override)) {
      // If the key is a major config slice, we ensure it's not nullified
      if (value === null || value === undefined) continue;
      
      result[key] = key in base 
        ? deepMerge((base as JsonRecord)[key], value) 
        : value;
    }
    return result as T;
  }

  return (override ?? base) as T;
}

export function cloneDefaultFrontendData(): FrontendData {
  return JSON.parse(JSON.stringify(defaultFrontendData)) as FrontendData;
}

export function mergeFrontendData(data: unknown): FrontendData {
  if (!data || typeof data !== "object") return cloneDefaultFrontendData();
  return deepMerge(cloneDefaultFrontendData(), data);
}
