import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { dispatchOrderEmails } from "@/backend/server/orderEmail.helpers";

// ── Input schema ──────────────────────────────────────────────────────────────
const createOrderInput = z.object({
  customerName:    z.string().min(1).max(200),
  customerPhone:   z.string().min(1).max(50),
  customerEmail:   z.string().email().max(200),
  deliveryMethod:  z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().max(500).nullable(),
  paymentMethod:   z.enum(["cash", "credit_card"]),
  notes:           z.string().max(1000).nullable(),
  couponCode:      z.string().max(100).nullable(),
  idempotencyKey:  z.string().uuid(),
  customerLocale:  z.enum(["en", "he", "ar"]).optional().default("he"),
});

export type CreateOrderInput = z.infer<typeof createOrderInput>;

// ── Return type ───────────────────────────────────────────────────────────────
export type CreateOrderResult =
  | { ok: true;  orderId: string; idempotent: boolean }
  | { ok: false; errorKey: string; detail?: string };

// ── Map PostgreSQL error codes → i18n keys already present in the frontend ───
const PG_ERROR_MAP: Record<string, string> = {
  ERR_UNAUTHENTICATED:           "genericError",
  ERR_CART_EMPTY:                "genericError",
  ERR_PRODUCT_UNAVAILABLE:       "genericError",
  ERR_INSUFFICIENT_STOCK:        "genericError",
  ERR_MISSING_NAME:              "genericError",
  ERR_MISSING_PHONE:             "genericError",
  ERR_MISSING_EMAIL:             "genericError",
  ERR_INVALID_DELIVERY_METHOD:   "genericError",
  ERR_INVALID_PAYMENT_METHOD:    "genericError",
  ERR_MISSING_DELIVERY_ADDRESS:  "deliveryAddressRequiredError",
  ERR_COUPON_INVALID:            "invalidCoupon",
  ERR_COUPON_EXPIRED:            "couponExpired",
  ERR_COUPON_EXHAUSTED:          "couponExhausted",
  ERR_COUPON_MIN_ORDER:          "couponMinOrderLabel",
};

function parseDbError(raw: string): { errorKey: string; detail?: string } {
  // raw format: "ERR_CODE" or "ERR_CODE:detail"
  const colonIdx = raw.indexOf(":");
  const code   = colonIdx === -1 ? raw.trim() : raw.slice(0, colonIdx).trim();
  const detail = colonIdx === -1 ? undefined  : raw.slice(colonIdx + 1).trim();
  const errorKey = PG_ERROR_MAP[code] ?? "genericError";
  return { errorKey, detail: detail || undefined };
}

// ── Server function ───────────────────────────────────────────────────────────
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => createOrderInput.parse(raw))
  .handler(async ({ data, context }): Promise<CreateOrderResult> => {
    const { supabase, userId } = context as {
      supabase: SupabaseClient<Database>;
      userId:   string;
    };

    const { data: result, error } = await supabase.rpc("create_order_secure", {
      p_customer_name:    data.customerName,
      p_customer_phone:   data.customerPhone,
      p_customer_email:   data.customerEmail,
      p_delivery_method:  data.deliveryMethod,
      p_delivery_address: data.deliveryAddress ?? "",
      p_payment_method:   data.paymentMethod,
      p_notes:            data.notes           ?? "",
      p_coupon_code:      data.couponCode       ?? "",
      p_idempotency_key:  data.idempotencyKey,
      p_customer_locale:  data.customerLocale,
    });

    if (error) {
      console.error("[createOrder] RPC error:", error.message);
      const { errorKey, detail } = parseDbError(error.message);
      return { ok: false, errorKey, detail };
    }

    const res = result as { order_id: string; idempotent: boolean } | null;
    if (!res?.order_id) {
      return { ok: false, errorKey: "genericError" };
    }

    // Send emails server-side (await so Vercel does not kill the function early).
    if (!res.idempotent) {
      try {
        await dispatchOrderEmails(supabase, res.order_id, userId);
      } catch (e: unknown) {
        console.error("[createOrder] Order emails:", e);
      }
    }

    return { ok: true, orderId: res.order_id, idempotent: res.idempotent ?? false };
  });
