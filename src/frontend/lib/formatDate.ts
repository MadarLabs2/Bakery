import { ar, enUS, he as heIL } from "date-fns/locale";
import type { Locale } from "date-fns";
import { format } from "date-fns";
import type { Lang } from "@/frontend/lib/i18n";

export function orderDateLocale(lang: Lang): Locale {
  if (lang === "he") return heIL;
  if (lang === "ar") return ar;
  return enUS;
}

export function formatOrderDate(iso: string, lang: Lang, pattern: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return format(d, pattern, { locale: orderDateLocale(lang) });
}
