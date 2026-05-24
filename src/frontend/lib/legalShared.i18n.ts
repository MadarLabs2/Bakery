import type { Lang } from "@/frontend/lib/i18n";

/** Shared labels for Privacy, Terms, and other legal pages */
export const legalSharedDict = {
  legalEffectiveDate: {
    en: "Effective date:",
    he: "תאריך תחולה:",
    ar: "تاريخ السريان:",
  },
  legalOnThisPage: {
    en: "On this page",
    he: "בעמוד זה",
    ar: "في هذه الصفحة",
  },
  legalTocAria: {
    en: "Table of contents",
    he: "תוכן עניינים",
    ar: "جدول المحتويات",
  },
  legalReturnHome: {
    en: "Return to homepage",
    he: "חזרה לדף הבית",
    ar: "العودة للصفحة الرئيسية",
  },
  legalContactEmail: { en: "Email:", he: "אימייל:", ar: "البريد الإلكتروني:" },
  legalContactPhone: { en: "Phone:", he: "טלפון:", ar: "الهاتف:" },
  legalContactAddress: { en: "Address:", he: "כתובת:", ar: "العنوان:" },
  legalContactWebsite: { en: "Website:", he: "אתר:", ar: "الموقع:" },
} as const;

export type LegalSharedKey = keyof typeof legalSharedDict;

export function legalSharedT(key: LegalSharedKey, lang: Lang): string {
  const entry = legalSharedDict[key];
  return entry[lang] ?? entry.en;
}
