import { supabase } from "@/backend/db/client";
import type { Lang } from "@/frontend/lib/i18n";
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

export type FulfillmentTimeSlotRow = {
  id: string;
  fulfillment_type: FulfillmentType;
  day_of_week: number;
  time_value: string;
  enabled: boolean;
};

export type AvailableDateOption = {
  date: Date;
  isoDate: string;
  dayOfWeek: number;
  label: string;
};

export type WeekdayAvailability = Record<number, boolean>;
export type DaySlotsState = Record<number, string[]>;

export type FulfillmentScheduleSelection = {
  isoDate: string;
  dayOfWeek: number;
  timeValue: string;
  summaryLabel: string;
};

export type FulfillmentTypeConfig = {
  days: WeekdayAvailability;
  slots: DaySlotsState;
};

export type FullAvailabilityConfig = {
  pickup: FulfillmentTypeConfig;
  delivery: FulfillmentTypeConfig;
};

export const UPCOMING_DATE_COUNT = 4;

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

/** Normalize DB time "HH:MM:SS" or input "HH:MM" → "HH:MM". */
export function normalizeTimeValue(raw: string): string | null {
  const trimmed = raw.trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (!match) return null;
  const h = Number.parseInt(match[1], 10);
  const m = Number.parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTimeDisplay(timeValue: string): string {
  return normalizeTimeValue(timeValue) ?? timeValue;
}

export function sortTimeValues(times: string[]): string[] {
  return [...times].sort((a, b) => {
    const na = normalizeTimeValue(a);
    const nb = normalizeTimeValue(b);
    if (!na || !nb) return a.localeCompare(b);
    return na.localeCompare(nb);
  });
}

export function formatFulfillmentDateLabel(
  date: Date,
  dayOfWeek: number,
  t: Translate,
): string {
  return `${t(weekdayDictKey(dayOfWeek))} — ${formatShortDate(date)}`;
}

export function buildScheduleSummaryLabel(
  type: FulfillmentType,
  date: Date,
  dayOfWeek: number,
  timeValue: string,
  t: Translate,
): string {
  const weekday = t(weekdayDictKey(dayOfWeek));
  const time = formatTimeDisplay(timeValue);
  const prefix = type === "pickup" ? t("pickupScheduledFor") : t("deliveryScheduledFor");
  return `${prefix} ${weekday}, ${formatShortDate(date)} · ${time}`;
}

export function buildCheckoutScheduleSummary(
  type: FulfillmentType,
  isoDate: string,
  dayOfWeek: number,
  timeValue: string,
  lang: Lang,
): string {
  const t = (key: keyof typeof fulfillmentDaysDict) => fulfillmentDaysDict[key][lang];
  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return "";
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(date.getTime())) return "";

  const weekday = t(weekdayDictKey(dayOfWeek));
  const time = formatTimeDisplay(timeValue);
  const prefix = type === "pickup" ? t("pickupScheduledFor") : t("deliveryScheduledFor");

  if (lang === "en") {
    return `${prefix} ${weekday}, ${formatShortDate(date)} at ${time}`;
  }
  return `${prefix} ${weekday}, ${formatShortDate(date)} · ${time}`;
}

export function computeNextAvailableDates(
  enabledDayOfWeek: number[],
  count = UPCOMING_DATE_COUNT,
  startFrom: Date = new Date(),
): Date[] {
  const enabled = new Set(enabledDayOfWeek);
  if (enabled.size === 0) return [];

  const start = new Date(startFrom);
  start.setHours(0, 0, 0, 0);

  const results: Date[] = [];
  for (let offset = 0; offset < 366 && results.length < count; offset++) {
    const d = new Date(start);
    d.setDate(start.getDate() + offset);
    if (enabled.has(d.getDay())) {
      results.push(d);
    }
  }
  return results;
}

export function buildAvailableDateOptions(
  enabledDayOfWeek: number[],
  t: Translate,
  count = UPCOMING_DATE_COUNT,
): AvailableDateOption[] {
  return computeNextAvailableDates(enabledDayOfWeek, count).map((date) => {
    const dayOfWeek = date.getDay();
    return {
      date,
      isoDate: toIsoDate(date),
      dayOfWeek,
      label: formatFulfillmentDateLabel(date, dayOfWeek, t),
    };
  });
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

export function rowsToSlotsMap(rows: FulfillmentTimeSlotRow[], type: FulfillmentType): DaySlotsState {
  const map: DaySlotsState = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const row of rows) {
    if (row.fulfillment_type !== type || !row.enabled) continue;
    const normalized = normalizeTimeValue(row.time_value);
    if (!normalized) continue;
    const list = map[row.day_of_week] ?? [];
    if (!list.includes(normalized)) list.push(normalized);
    map[row.day_of_week] = sortTimeValues(list);
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

export function getTimeSlotsForDay(
  slots: DaySlotsState,
  dayOfWeek: number,
): string[] {
  return sortTimeValues(slots[dayOfWeek] ?? []);
}

export function emptyDaySlots(): DaySlotsState {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

export function emptyWeekdayMap(): WeekdayAvailability {
  return { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
}

export function defaultPickupConfig(): FulfillmentTypeConfig {
  return {
    days: { ...emptyWeekdayMap(), 2: true, 5: true },
    slots: {
      ...emptyDaySlots(),
      2: ["10:00", "12:00", "14:00"],
      5: ["09:00", "11:00", "13:00"],
    },
  };
}

export function defaultDeliveryConfig(): FulfillmentTypeConfig {
  return {
    days: { ...emptyWeekdayMap(), 2: true, 5: true },
    slots: {
      ...emptyDaySlots(),
      2: ["15:00", "17:00"],
      5: ["10:00", "12:00"],
    },
  };
}

export function validateTypeConfig(config: FulfillmentTypeConfig): string | null {
  if (!hasAtLeastOneEnabled(config.days)) return "MIN_ONE_DAY_REQUIRED";
  for (let dow = 0; dow <= 6; dow++) {
    if (!config.days[dow]) continue;
    const slots = getTimeSlotsForDay(config.slots, dow);
    if (slots.length === 0) return "ENABLED_DAY_NEEDS_SLOT";
  }
  return null;
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

export async function fetchFulfillmentTimeSlots(): Promise<
  { ok: true; rows: FulfillmentTimeSlotRow[] } | { ok: false; message: string }
> {
  const { data, error } = await supabase
    .from("fulfillment_time_slots")
    .select("id, fulfillment_type, day_of_week, time_value, enabled")
    .order("fulfillment_type")
    .order("day_of_week")
    .order("time_value");

  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    rows: (data ?? []).map((r) => ({
      ...r,
      time_value: String(r.time_value).slice(0, 5),
    })) as FulfillmentTimeSlotRow[],
  };
}

export async function fetchFullAvailability(): Promise<
  { ok: true; config: FullAvailabilityConfig } | { ok: false; message: string }
> {
  const [daysRes, slotsRes] = await Promise.all([fetchFulfillmentDays(), fetchFulfillmentTimeSlots()]);
  if (!daysRes.ok) return daysRes;
  if (!slotsRes.ok) return slotsRes;

  return {
    ok: true,
    config: {
      pickup: {
        days: rowsToWeekdayMap(daysRes.rows, "pickup"),
        slots: rowsToSlotsMap(slotsRes.rows, "pickup"),
      },
      delivery: {
        days: rowsToWeekdayMap(daysRes.rows, "delivery"),
        slots: rowsToSlotsMap(slotsRes.rows, "delivery"),
      },
    },
  };
}

export async function fetchAvailabilityByType(
  type: FulfillmentType,
): Promise<
  | { ok: true; days: WeekdayAvailability; slots: DaySlotsState; enabledDays: number[] }
  | { ok: false; message: string }
> {
  const result = await fetchFullAvailability();
  if (!result.ok) return result;
  const cfg = result.config[type];
  return {
    ok: true,
    days: cfg.days,
    slots: cfg.slots,
    enabledDays: enabledDaysFromMap(cfg.days),
  };
}

export async function saveFullAvailability(
  config: FullAvailabilityConfig,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const pickupErr = validateTypeConfig(config.pickup);
  if (pickupErr) return { ok: false, message: pickupErr };
  const deliveryErr = validateTypeConfig(config.delivery);
  if (deliveryErr) return { ok: false, message: deliveryErr };

  const dayUpserts: { fulfillment_type: FulfillmentType; day_of_week: number; enabled: boolean }[] = [];
  const slotRows: { fulfillment_type: FulfillmentType; day_of_week: number; time_value: string; enabled: boolean }[] = [];

  for (const fulfillment_type of ["pickup", "delivery"] as const) {
    const typeCfg = config[fulfillment_type];
    for (let day_of_week = 0; day_of_week <= 6; day_of_week++) {
      dayUpserts.push({
        fulfillment_type,
        day_of_week,
        enabled: typeCfg.days[day_of_week] ?? false,
      });
      if (!typeCfg.days[day_of_week]) continue;
      for (const time of getTimeSlotsForDay(typeCfg.slots, day_of_week)) {
        slotRows.push({ fulfillment_type, day_of_week, time_value: time, enabled: true });
      }
    }
  }

  const { error: dayError } = await supabase
    .from("fulfillment_available_days")
    .upsert(dayUpserts, { onConflict: "fulfillment_type,day_of_week" });
  if (dayError) return { ok: false, message: dayError.message };

  for (const fulfillment_type of ["pickup", "delivery"] as const) {
    const { error: delError } = await supabase
      .from("fulfillment_time_slots")
      .delete()
      .eq("fulfillment_type", fulfillment_type);
    if (delError) return { ok: false, message: delError.message };
  }

  if (slotRows.length > 0) {
    const { error: slotError } = await supabase.from("fulfillment_time_slots").insert(slotRows);
    if (slotError) return { ok: false, message: slotError.message };
  }

  return { ok: true };
}

/** @deprecated Use saveFullAvailability */
export async function saveFulfillmentAvailability(
  pickup: WeekdayAvailability,
  delivery: WeekdayAvailability,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const current = await fetchFullAvailability();
  const pickupSlots = current.ok ? current.config.pickup.slots : defaultPickupConfig().slots;
  const deliverySlots = current.ok ? current.config.delivery.slots : defaultDeliveryConfig().slots;
  return saveFullAvailability({
    pickup: { days: pickup, slots: pickupSlots },
    delivery: { days: delivery, slots: deliverySlots },
  });
}

export function fulfillmentLabelFromOrder(
  isoDate: string | null | undefined,
  dayOfWeek: number | null | undefined,
  storedLabel: string | null | undefined,
  lang: Lang,
  timeValue?: string | null,
): string | null {
  if (storedLabel?.trim()) return storedLabel.trim();
  if (!isoDate || dayOfWeek == null) return null;

  const parts = isoDate.split("-").map(Number);
  if (parts.length !== 3) return null;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  if (Number.isNaN(date.getTime())) return null;

  const t = (key: keyof typeof fulfillmentDaysDict) => fulfillmentDaysDict[key][lang];
  const base = formatFulfillmentDateLabel(date, dayOfWeek, t);
  if (timeValue) {
    return `${base} · ${formatTimeDisplay(timeValue)}`;
  }
  return base;
}
