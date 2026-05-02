/**
 * Social / contact links for the customer site.
 * Set the `VITE_*` variables in `.env` (local) and in your host’s build env — no hardcoded numbers here.
 */

function env(key: string): string | undefined {
  const v = import.meta.env[key];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

/** E.164 without + (e.g. 972549470881). Used for https://wa.me/… */
export function getWhatsAppE164(): string {
  return env("VITE_WHATSAPP_E164")?.replace(/\D/g, "") ?? "";
}

/** Full Instagram profile URL */
export function getInstagramUrl(): string {
  return env("VITE_INSTAGRAM_URL") ?? "";
}

/**
 * Pre-filled WhatsApp first message (`?text=` on wa.me).
 * Set `VITE_WHATSAPP_DEFAULT_MESSAGE` in `.env` (use double quotes if the sentence has commas).
 */
export function getWhatsAppDefaultMessage(): string {
  return env("VITE_WHATSAPP_DEFAULT_MESSAGE") ?? "";
}

/**
 * Text shown next to the phone icon (footer + contact).
 * Optional — if unset, a simple display is derived from `VITE_WHATSAPP_E164` when it looks like 972…
 */
export function getContactPhoneDisplay(): string {
  const explicit = env("VITE_CONTACT_PHONE_DISPLAY");
  if (explicit) return explicit;
  const e164 = getWhatsAppE164();
  if (!e164) return "";
  if (e164.startsWith("972") && e164.length >= 12) {
    const national = `0${e164.slice(3)}`;
    return `${national.slice(0, 3)}-${national.slice(3)}`;
  }
  return `+${e164}`;
}

export const SOCIAL_TOOLTIPS = {
  whatsapp: "Contact us on WhatsApp",
  instagram: "Follow us on Instagram",
} as const;

export function getWhatsAppChatUrl(): string {
  const digits = getWhatsAppE164();
  if (!digits) return "";
  const msg = getWhatsAppDefaultMessage();
  if (msg) return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  return `https://wa.me/${digits}`;
}

export function hasWhatsAppLink(): boolean {
  return Boolean(getWhatsAppE164());
}

export function hasInstagramLink(): boolean {
  return Boolean(getInstagramUrl());
}

export function hasAnySocialLink(): boolean {
  return hasWhatsAppLink() || hasInstagramLink();
}
