import type { DeliveryAddressFields } from "@/frontend/lib/checkoutDelivery";
import { isDeliveryAddressComplete } from "@/frontend/lib/checkoutDelivery";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export type ContactFields = {
  name: string;
  phone: string;
  email: string;
};

export type ContactFieldErrors = Partial<Record<keyof ContactFields, string>>;

export function validateContact(
  fields: ContactFields,
  t: (key: string) => string,
): { ok: true } | { ok: false; errors: ContactFieldErrors; message?: string } {
  const errors: ContactFieldErrors = {};
  if (!fields.name.trim()) errors.name = t("fieldRequired");
  if (!fields.phone.trim()) errors.phone = t("fieldRequired");
  if (!fields.email.trim()) errors.email = t("fieldRequired");
  else if (!isValidEmail(fields.email)) errors.email = t("invalidEmail");
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: t("checkoutContactRequired") };
  }
  return { ok: true };
}

export function validateDeliveryAddress(
  fields: DeliveryAddressFields,
  t: (key: string) => string,
): { ok: true } | { ok: false; errors: Partial<Record<keyof DeliveryAddressFields, string>> } {
  if (isDeliveryAddressComplete(fields)) return { ok: true };
  const errors: Partial<Record<keyof DeliveryAddressFields, string>> = {};
  if (!fields.city.trim()) errors.city = t("fieldRequired");
  if (!fields.street.trim()) errors.street = t("fieldRequired");
  if (!fields.houseNumber.trim()) errors.houseNumber = t("fieldRequired");
  return { ok: false, errors };
}
