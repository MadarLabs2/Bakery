/** @deprecated Use `useDeliveryFee()` / `fetchDeliveryFee()` — fee is stored in `store_settings`. */
export { DEFAULT_DELIVERY_FEE as CHECKOUT_DELIVERY_FEE } from "@/frontend/lib/storeSettings";

export const BAKERY_PICKUP_ADDRESS = "רהט, חארה 24, ליד מסגד אלנור";

export const BAKERY_PICKUP_PHONES = ["0537636011", "0508588985"] as const;

export type DeliveryMethod = "pickup" | "delivery";

export type DeliveryAddressFields = {
  city: string;
  street: string;
  houseNumber: string;
  apartment: string;
  deliveryNotes: string;
};

export const emptyDeliveryAddress = (): DeliveryAddressFields => ({
  city: "",
  street: "",
  houseNumber: "",
  apartment: "",
  deliveryNotes: "",
});

/** Structured address stored in `orders.delivery_address`. */
export function formatDeliveryAddress(fields: DeliveryAddressFields): string {
  const parts: string[] = [];
  const streetLine = [fields.street.trim(), fields.houseNumber.trim()].filter(Boolean).join(" ");
  if (streetLine) parts.push(streetLine);
  const apt = fields.apartment.trim();
  if (apt) parts.push(`דירה / Apt: ${apt}`);
  const city = fields.city.trim();
  if (city) parts.push(city);
  const notes = fields.deliveryNotes.trim();
  if (notes) parts.push(`הערות משלוח / Delivery notes: ${notes}`);
  return parts.join("\n");
}

export function isDeliveryAddressComplete(fields: DeliveryAddressFields): boolean {
  return Boolean(fields.city.trim() && fields.street.trim() && fields.houseNumber.trim());
}

/** One-line summary for checkout UI after address is saved. */
export function formatDeliveryAddressShort(fields: DeliveryAddressFields): string {
  const streetLine = [fields.street.trim(), fields.houseNumber.trim()].filter(Boolean).join(" ");
  const apt = fields.apartment.trim();
  const city = fields.city.trim();
  return [streetLine, apt ? `${apt}` : "", city].filter(Boolean).join(", ");
}
