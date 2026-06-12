import { ar, enUS, he as heIL } from "date-fns/locale";
import type { Locale } from "date-fns";
import { format } from "date-fns";
import type { Lang } from "@/frontend/lib/i18n";

export function orderDateLocale(lang: Lang): Locale {
  if (lang === "he") return heIL;
  if (lang === "ar") return ar;
  return enUS;
}

export function orderDatePattern(lang: Lang, withTime = false): string {
  if (lang === "en") return withTime ? "PP p" : "PP";
  return withTime ? "d MMMM yyyy, HH:mm" : "d MMMM yyyy";
}

export function formatOrderDate(iso: string, lang: Lang, pattern: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return format(d, pattern, { locale: orderDateLocale(lang) });
}

/** Locale-aware date for order lists — avoids RTL bidi issues with `PP` in Hebrew/Arabic. */
export function formatOrderDateDisplay(iso: string, lang: Lang, withTime = false): string {
  return formatOrderDate(iso, lang, orderDatePattern(lang, withTime));
}

export function shortOrderRef(orderId: string): string {
  return `#${orderId.slice(0, 8)}`;
}
