import { supabase } from "@/backend/db/client";
import { formatShortDate, toIsoDate } from "@/frontend/lib/fulfillmentDays";

export type RestDayRow = {
  id: string;
  start_date: string;
  end_date: string | null;
  reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * When true, checkout blocks all new orders while today is an active rest day.
 * Rest days always block the selected fulfillment date regardless of this flag.
 */
export const REST_DAY_BLOCKS_CHECKOUT_TODAY = true;

export function restDayEndDate(row: RestDayRow): string {
  return row.end_date ?? row.start_date;
}

export function isDateRestDay(isoDate: string, restDays: RestDayRow[]): boolean {
  for (const row of restDays) {
    if (!row.is_active) continue;
    const start = row.start_date;
    const end = restDayEndDate(row);
    if (isoDate >= start && isoDate <= end) return true;
  }
  return false;
}

export function isTodayRestDay(restDays: RestDayRow[]): boolean {
  const today = toIsoDate(new Date());
  return isDateRestDay(today, restDays);
}

export function dateRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

export function hasOverlappingRestDay(
  startDate: string,
  endDate: string,
  existing: RestDayRow[],
  excludeId?: string,
): boolean {
  return existing.some((row) => {
    if (excludeId && row.id === excludeId) return false;
    if (!row.is_active) return false;
    return dateRangesOverlap(
      startDate,
      endDate,
      row.start_date,
      restDayEndDate(row),
    );
  });
}

export function formatRestDayRange(row: RestDayRow): string {
  const end = restDayEndDate(row);
  if (end === row.start_date) {
    const parts = row.start_date.split("-").map(Number);
    if (parts.length !== 3) return row.start_date;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return formatShortDate(d);
  }
  const sp = row.start_date.split("-").map(Number);
  const ep = end.split("-").map(Number);
  if (sp.length !== 3 || ep.length !== 3) return `${row.start_date} – ${end}`;
  const sd = new Date(sp[0], sp[1] - 1, sp[2]);
  const ed = new Date(ep[0], ep[1] - 1, ep[2]);
  return `${formatShortDate(sd)} – ${formatShortDate(ed)}`;
}

export async function fetchActiveRestDays(): Promise<
  { ok: true; rows: RestDayRow[] } | { ok: false; message: string }
> {
  const today = toIsoDate(new Date());
  const { data, error } = await supabase
    .from("bakery_rest_days")
    .select("id, start_date, end_date, reason, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("start_date", { ascending: true });

  if (error) {
    if (error.message.includes("bakery_rest_days")) {
      return { ok: true, rows: [] };
    }
    return { ok: false, message: error.message };
  }

  const rows = ((data ?? []) as RestDayRow[]).filter((row) => restDayEndDate(row) >= today);
  return { ok: true, rows };
}

export async function fetchAdminRestDays(): Promise<
  { ok: true; rows: RestDayRow[] } | { ok: false; message: string }
> {
  const today = toIsoDate(new Date());
  const { data, error } = await supabase
    .from("bakery_rest_days")
    .select("id, start_date, end_date, reason, is_active, created_at, updated_at")
    .order("start_date", { ascending: true });

  if (error) return { ok: false, message: error.message };

  const rows = ((data ?? []) as RestDayRow[]).filter((r) => restDayEndDate(r) >= today);
  return { ok: true, rows };
}

export async function createRestDay(input: {
  startDate: string;
  endDate: string | null;
  reason: string | null;
}): Promise<{ ok: true; row: RestDayRow } | { ok: false; message: string }> {
  const end = input.endDate?.trim() || null;
  if (end && end < input.startDate) {
    return { ok: false, message: "END_BEFORE_START" };
  }

  const existing = await fetchAdminRestDays();
  if (!existing.ok) return existing;
  if (hasOverlappingRestDay(input.startDate, end ?? input.startDate, existing.rows)) {
    return { ok: false, message: "OVERLAP" };
  }

  const { data, error } = await supabase
    .from("bakery_rest_days")
    .insert({
      start_date: input.startDate,
      end_date: end,
      reason: input.reason?.trim() || null,
      is_active: true,
    })
    .select("id, start_date, end_date, reason, is_active, created_at, updated_at")
    .single();

  if (error) return { ok: false, message: error.message };
  return { ok: true, row: data as RestDayRow };
}

export async function deleteRestDay(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("bakery_rest_days").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function updateRestDayStatus(
  id: string,
  isActive: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.from("bakery_rest_days").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
