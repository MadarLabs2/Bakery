import { supabase } from "@/backend/db/client";

export const DELIVERY_FEE_SETTING_KEY = "delivery_fee";
export const HOMEPAGE_CATEGORY_ORDER_KEY = "homepage_category_order";

/** Fallback when DB row is missing or unreadable. */
export const DEFAULT_DELIVERY_FEE = 20;

export function parseDeliveryFeeValue(raw: string | null | undefined): number {
  const n = Number.parseFloat(String(raw ?? "").trim());
  if (!Number.isFinite(n) || n < 0) return DEFAULT_DELIVERY_FEE;
  return Math.round(n * 100) / 100;
}

export function isValidDeliveryFeeInput(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return false;
  const n = Number.parseFloat(trimmed);
  return Number.isFinite(n) && n >= 0;
}

export async function fetchDeliveryFee(): Promise<number> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("setting_value")
    .eq("setting_key", DELIVERY_FEE_SETTING_KEY)
    .maybeSingle();

  if (error) {
    console.warn("[store_settings] delivery_fee:", error.message);
    return DEFAULT_DELIVERY_FEE;
  }
  return parseDeliveryFeeValue(data?.setting_value);
}

export async function updateDeliveryFee(fee: number): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalized = Math.round(fee * 100) / 100;
  const { error } = await supabase.from("store_settings").upsert(
    {
      setting_key: DELIVERY_FEE_SETTING_KEY,
      setting_value: String(normalized),
      description: "Default delivery fee for customer orders",
    },
    { onConflict: "setting_key" },
  );

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function fetchHomepageCategoryOrder(): Promise<string[] | null> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("setting_value")
    .eq("setting_key", HOMEPAGE_CATEGORY_ORDER_KEY)
    .maybeSingle();

  if (error) {
    console.warn("[store_settings] homepage_category_order:", error.message);
    return null;
  }

  const raw = data?.setting_value;
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return null;
  }
}

export async function updateHomepageCategoryOrder(
  categoryIds: string[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("store_settings").upsert(
    {
      setting_key: HOMEPAGE_CATEGORY_ORDER_KEY,
      setting_value: JSON.stringify(categoryIds),
      description: "Homepage category section display order (JSON array of category UUIDs)",
    },
    { onConflict: "setting_key" },
  );

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
