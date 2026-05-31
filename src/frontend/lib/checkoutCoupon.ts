import type { dict } from "@/frontend/lib/i18n";

export type CouponRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

export const COUPON_SELECT =
  "id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at, is_active" as const;

export function validateCouponForSubtotal(
  data: CouponRow,
  subtotal: number,
  t: (key: keyof typeof dict) => string,
): { ok: true; discount: number } | { ok: false; message: string } {
  if (!data.is_active) return { ok: false, message: t("invalidCoupon") };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, message: t("couponExpired") };
  }
  if (data.max_uses != null && data.used_count >= data.max_uses) {
    return { ok: false, message: t("couponExhausted") };
  }
  const minAmt = Number(data.min_order_amount ?? 0);
  if (subtotal < minAmt) {
    return { ok: false, message: `${t("couponMinOrderLabel")}: ₪${minAmt}` };
  }
  const raw =
    data.discount_type === "percentage"
      ? (subtotal * Number(data.discount_value)) / 100
      : Number(data.discount_value);
  const capped = Math.min(Math.max(0, raw), subtotal);
  return { ok: true, discount: capped };
}
