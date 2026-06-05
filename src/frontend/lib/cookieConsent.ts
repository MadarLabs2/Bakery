export const COOKIE_CONSENT_STORAGE_KEY = "alnour_cookie_consent";

export const PREFERENCES_REVOKED_EVENT = "alnour-preferences-revoked";

export type CookieConsentRecord = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
};

export type CookieCategoryDraft = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

function isRecord(value: unknown): value is CookieConsentRecord {
  if (!value || typeof value !== "object") return false;
  const v = value as CookieConsentRecord;
  return (
    v.essential === true &&
    typeof v.preferences === "boolean" &&
    typeof v.analytics === "boolean" &&
    typeof v.marketing === "boolean" &&
    typeof v.acceptedAt === "string"
  );
}

export function loadCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(
  draft: CookieCategoryDraft,
  acceptedAt = new Date().toISOString(),
): CookieConsentRecord {
  const record: CookieConsentRecord = {
    essential: true,
    preferences: draft.preferences,
    analytics: draft.analytics,
    marketing: draft.marketing,
    acceptedAt,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  }
  return record;
}

export function hasCookieConsentChoice(): boolean {
  return loadCookieConsent() !== null;
}

export function allowsPreferencesStorage(): boolean {
  const consent = loadCookieConsent();
  if (!consent) return true;
  return consent.preferences;
}

export function allowsAnalytics(): boolean {
  return loadCookieConsent()?.analytics === true;
}

export function allowsMarketing(): boolean {
  return loadCookieConsent()?.marketing === true;
}

export function acceptAllCookies(): CookieConsentRecord {
  return saveCookieConsent({
    preferences: true,
    analytics: true,
    marketing: true,
  });
}

export function rejectNonEssentialCookies(): CookieConsentRecord {
  return saveCookieConsent({
    preferences: false,
    analytics: false,
    marketing: false,
  });
}

export function revokePreferenceStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("lang");
  window.dispatchEvent(new CustomEvent(PREFERENCES_REVOKED_EVENT));
}
