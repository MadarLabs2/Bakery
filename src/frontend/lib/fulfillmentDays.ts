import { supabase } from "@/backend/db/client";
import type { Lang } from "@/frontend/lib/i18n";
import { isDateRestDay, type RestDayRow } from "@/frontend/lib/restDays";
import {
  WEEKDAY_DICT_KEYS,
  type WeekdayDictKey,
  fulfillmentDaysDict,
} from "@/frontend/lib/fulfillmentDays.i18n";

export type FulfillmentType = "pickup" | "delivery";

export type FulfillmentDayRow = {
  id: string;
  fulfillment_type: FulfillmentType;
  day_of_week: number;
  enabled: boolean;
};

export type AvailableDateOption = {
  date: Date;
  isoDate: string;
  dayOfWeek: number;
  label: string;
};

export type WeekdayAvailability = Record<number, boolean>;

export type FulfillmentDateSelection = {
  isoDate: string;
  dayOfWeek: number;
  summaryLabel: string;
};

/** Two calendar weeks (Sun–Sat × 2) shown to customers and in admin. */
export const SCHEDULE_WINDOW_DAYS = 14;

type Translate = (key: keyof typeof fulfillmentDaysDict) => string;

export function weekdayDictKey(dayOfWeek: number): WeekdayDictKey {
  return WEEKDAY_DICT_KEYS[dayOfWeek] ?? "weekdaySunday";
}

export function formatShortDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatFulfillmentDateLabel(
  date: Date,
  dayOfWeek: number,
  t: Translate,
): string {
  return `${t(weekdayDictKey(dayOfWeek))} — ${formatShortDate(date)}`;
}

export function buildCheckoutDateSummary(
  type: FulfillmentType,
  isoDate: string,
  dayOfWeek: number,
  lang: Lang,
): string {
  const t = (key: keyof typeof fulfillmentDaysDict) => fulfillmentDaysDict[key][lang];
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return "";
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(date.getTime())) return "";

  const weekday = t(weekdayDictKey(dayOfWeek));
  const prefix = type === "pickup" ? t("pickupScheduledFor") : t("deliveryScheduledFor");
  if (lang === "en") {
    return `${prefix}: ${weekday}, ${formatShortDate(date)}`;
  }
  return `${prefix} ${weekday}, ${formatShortDate(date)}`;
}

export function getCurrentWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function computeScheduleDates(
  enabledDayOfWeek: number[],
  restDays: RestDayRow[] = [],
  startFrom: Date = new Date(),
  includeClosed = false,
): Date[] {
  const enabled = new Set(enabledDayOfWeek);
  if (enabled.size === 0) return [];

  const today = new Date(startFrom);
  today.setHours(0, 0, 0, 0);

  const weekStart = getCurrentWeekStart(today);
  const windowEnd = new Date(weekStart);
  windowEnd.setDate(windowEnd.getDate() + SCHEDULE_WINDOW_DAYS - 1);

  const results: Date[] = [];
  for (let cursor = new Date(weekStart); cursor <= windowEnd; cursor.setDate(cursor.getDate() + 1)) {
    const d = new Date(cursor);
    if (d < today) continue;
    if (!enabled.has(d.getDay())) continue;
    if (!includeClosed && isDateRestDay(toIsoDate(d), restDays)) continue;
    results.push(d);
  }
  return results;
}

export type ScheduleDateOption = AvailableDateOption & {
  isOpen: boolean;
};

export function buildScheduleDateOptions(
  enabledDayOfWeek: number[],
  t: Translate,
  restDays: RestDayRow[] = [],
): ScheduleDateOption[] {
  return computeScheduleDates(enabledDayOfWeek, [], new Date(), true).map((date) => {
    const dayOfWeek = date.getDay();
    const isoDate = toIsoDate(date);
    return {
      date,
      isoDate,
      dayOfWeek,
      label: formatFulfillmentDateLabel(date, dayOfWeek, t),
      isOpen: !isDateRestDay(isoDate, restDays),
    };
  });
}

export function buildAvailableDateOptions(
  enabledDayOfWeek: number[],
  t: Translate,
  restDays: RestDayRow[] = [],
): AvailableDateOption[] {
  return buildScheduleDateOptions(enabledDayOfWeek, t, restDays)
    .filter((option) => option.isOpen)
    .map(({ date, isoDate, dayOfWeek, label }) => ({ date, isoDate, dayOfWeek, label }));
}

export function rowsToWeekdayMap(rows: FulfillmentDayRow[], type: FulfillmentType): WeekdayAvailability {
  const map: WeekdayAvailability = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  for (const row of rows) {
    if (row.fulfillment_type === type) {
      map[row.day_of_week] = row.enabled;
    }
  }
  return map;
}

export function enabledDaysFromMap(map: WeekdayAvailability): number[] {
  return Object.entries(map)
    .filter(([, enabled]) => enabled)
    .map(([dow]) => Number.parseInt(dow, 10));
}

export function hasAtLeastOneEnabled(map: WeekdayAvailability): boolean {
  return enabledDaysFromMap(map).length > 0;
}

export function emptyWeekdayMap(): WeekdayAvailability {
  return { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
}

export function defaultPickupDays(): WeekdayAvailability {
  return { ...emptyWeekdayMap(), 2: true, 5: true };
}

export function defaultDeliveryDays(): WeekdayAvailability {
  return { ...emptyWeekdayMap(), 2: true, 5: true };
}

export async function fetchFulfillmentDays(): Promise<
  { ok: true; rows: FulfillmentDayRow[] } | { ok: false; message: string }
> {
  const { data, error } = await supabase
    .from("fulfillment_available_days")
    .select("id, fulfillment_type, day_of_week, enabled")
    .order("fulfillment_type")
    .order("day_of_week");

  if (error) return { ok: false, message: error.message };
  return { ok: true, rows: (data ?? []) as FulfillmentDayRow[] };
}

export async function fetchAvailabilityByType(
  type: FulfillmentType,
): Promise<
  | { ok: true; days: WeekdayAvailability; enabledDays: number[] }
  | { ok: false; message: string }
> {
  const result = await fetchFulfillmentDays();
  if (!result.ok) return result;
  const days = rowsToWeekdayMap(result.rows, type);
  return {
    ok: true,
    days,
    enabledDays: enabledDaysFromMap(days),
  };
}

export async function saveFulfillmentAvailability(
  pickup: WeekdayAvailability,
  delivery: WeekdayAvailability,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasAtLeastOneEnabled(pickup)) return { ok: false, message: "MIN_ONE_DAY_REQUIRED" };
  if (!hasAtLeastOneEnabled(delivery)) return { ok: false, message: "MIN_ONE_DAY_REQUIRED" };

  const dayUpserts: { fulfillment_type: FulfillmentType; day_of_week: number; enabled: boolean }[] = [];

  for (const fulfillment_type of ["pickup", "delivery"] as const) {
    const map = fulfillment_type === "pickup" ? pickup : delivery;
    for (let day_of_week = 0; day_of_week <= 6; day_of_week++) {
      dayUpserts.push({
        fulfillment_type,
        day_of_week,
        enabled: map[day_of_week] ?? false,
      });
    }
  }

  const { error: dayError } = await supabase
    .from("fulfillment_available_days")
    .upsert(dayUpserts, { onConflict: "fulfillment_type,day_of_week" });
  if (dayError) return { ok: false, message: dayError.message };

  return { ok: true };
}

export function fulfillmentLabelFromOrder(
  isoDate: string | null | undefined,
  dayOfWeek: number | null | undefined,
  storedLabel: string | null | undefined,
  lang: Lang,
  deliveryMethod?: string | null,
): string | null {
  if (isoDate && dayOfWeek != null) {
    const type: FulfillmentType =
      String(deliveryMethod ?? "").toLowerCase() === "delivery" ? "delivery" : "pickup";
    const rebuilt = buildCheckoutDateSummary(type, isoDate, dayOfWeek, lang);
    if (rebuilt) return rebuilt;
  }

  if (storedLabel?.trim()) return storedLabel.trim();
  if (!isoDate || dayOfWeek == null) return null;

  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return null;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(date.getTime())) return null;

  const t = (key: keyof typeof fulfillmentDaysDict) => fulfillmentDaysDict[key][lang];
  return formatFulfillmentDateLabel(date, dayOfWeek, t);
}
