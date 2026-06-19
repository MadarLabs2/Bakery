import { supabase } from "@/backend/db/client";
import type { Lang } from "@/frontend/lib/i18n";
import { pickName } from "@/frontend/lib/i18n";

export type DeliveryPlaceRow = {
  id: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryPlaceInput = {
  nameHe: string;
  nameAr: string;
  nameEn: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
  description?: string | null;
};

function normalizePlaceNames(input: Pick<DeliveryPlaceInput, "nameHe" | "nameAr" | "nameEn">): {
  nameHe: string;
  nameAr: string;
  nameEn: string;
} | null {
  const nameHe = input.nameHe.trim();
  const nameAr = input.nameAr.trim();
  const nameEn = input.nameEn.trim();
  if (!nameHe && !nameAr && !nameEn) return null;

  const fallback = nameHe || nameEn || nameAr;
  return {
    nameHe: nameHe || fallback,
    nameAr: nameAr || fallback,
    nameEn: nameEn || fallback,
  };
}

export function pickDeliveryPlaceName(
  place: Pick<DeliveryPlaceRow, "name_he" | "name_ar" | "name_en">,
  lang: Lang,
): string {
  return pickName(
    { name_he: place.name_he, name_ar: place.name_ar, name_en: place.name_en },
    lang,
  );
}

export function isValidDeliveryPlacePrice(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const n = Number.parseFloat(trimmed);
  return Number.isFinite(n) && n >= 0;
}

export function parseDeliveryPlacePrice(value: string): number | null {
  if (!isValidDeliveryPlacePrice(value)) return null;
  return Number.parseFloat(value.trim());
}

export function validateDeliveryPlaceInput(input: DeliveryPlaceInput): string | null {
  if (!normalizePlaceNames(input)) return "NAME_REQUIRED";
  if (!Number.isFinite(input.price) || input.price < 0) return "PRICE_INVALID";
  return null;
}

export function calculateDeliveryFeeFromSelectedPlace(
  method: "pickup" | "delivery",
  place: DeliveryPlaceRow | null | undefined,
): number {
  if (method !== "delivery") return 0;
  if (!place) return 0;
  return Number(place.price) || 0;
}

export async function fetchActiveDeliveryPlaces(): Promise<
  { ok: true; rows: DeliveryPlaceRow[] } | { ok: false; message: string }
> {
  const { data, error } = await supabase
    .from("delivery_places")
    .select("id, name_he, name_ar, name_en, price, is_active, sort_order, description, created_at, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) {
    if (error.message.includes("delivery_places")) {
      return { ok: true, rows: [] };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true, rows: (data ?? []) as DeliveryPlaceRow[] };
}

export async function fetchAdminDeliveryPlaces(): Promise<
  { ok: true; rows: DeliveryPlaceRow[] } | { ok: false; message: string }
> {
  const { data, error } = await supabase
    .from("delivery_places")
    .select("id, name_he, name_ar, name_en, price, is_active, sort_order, description, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) return { ok: false, message: error.message };
  return { ok: true, rows: (data ?? []) as DeliveryPlaceRow[] };
}

export async function createDeliveryPlace(
  input: DeliveryPlaceInput,
): Promise<{ ok: true; row: DeliveryPlaceRow } | { ok: false; message: string }> {
  const validation = validateDeliveryPlaceInput(input);
  if (validation) return { ok: false, message: validation };

  const names = normalizePlaceNames(input);
  if (!names) return { ok: false, message: "NAME_REQUIRED" };

  const { data, error } = await supabase
    .from("delivery_places")
    .insert({
      name_he: names.nameHe,
      name_ar: names.nameAr,
      name_en: names.nameEn,
      price: input.price,
      is_active: input.isActive,
      sort_order: input.sortOrder,
      description: input.description?.trim() || null,
    })
    .select("id, name_he, name_ar, name_en, price, is_active, sort_order, description, created_at, updated_at")
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, row: data as DeliveryPlaceRow };
}

export async function updateDeliveryPlace(
  id: string,
  input: DeliveryPlaceInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const validation = validateDeliveryPlaceInput(input);
  if (validation) return { ok: false, message: validation };

  const names = normalizePlaceNames(input);
  if (!names) return { ok: false, message: "NAME_REQUIRED" };

  const { error } = await supabase
    .from("delivery_places")
    .update({
      name_he: names.nameHe,
      name_ar: names.nameAr,
      name_en: names.nameEn,
      price: input.price,
      is_active: input.isActive,
      sort_order: input.sortOrder,
      description: input.description?.trim() || null,
    })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function deleteDeliveryPlace(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("delivery_places").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function updateDeliveryPlaceStatus(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("delivery_places").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export function minDeliveryPlacePrice(places: DeliveryPlaceRow[]): number | null {
  if (places.length === 0) return null;
  return Math.min(...places.map((p) => Number(p.price)));
}
