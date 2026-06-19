import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { dispatchOrderEmails } from "@/backend/server/orderEmail.helpers";
import { isCardcomEnabled } from "@/backend/config/cardcom";
import { startCardcomPaymentForOrder } from "@/backend/server/cardcomPayment.helpers";

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
  customerLocale:  z.enum(["en", "he", "ar"]),
  fulfillmentDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fulfillmentDayOfWeek:  z.number().int().min(0).max(6),
  fulfillmentLabel:      z.string().min(1).max(200),
  deliveryPlaceId:       z.string().uuid().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderInput>;

// ── Return type ───────────────────────────────────────────────────────────────
export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      idempotent: boolean;
      requiresPayment?: boolean;
      paymentRedirectUrl?: string;
    }
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
  ERR_MISSING_FULFILLMENT_DATE:  "fulfillmentDateRequired",
  ERR_INVALID_FULFILLMENT_DAY:   "fulfillmentDateRequired",
  ERR_FULFILLMENT_DAY_MISMATCH:  "fulfillmentDateRequired",
  ERR_FULFILLMENT_DATE_PAST:     "fulfillmentDateRequired",
  ERR_FULFILLMENT_DAY_NOT_AVAILABLE: "fulfillmentDateRequired",
  ERR_FULFILLMENT_REST_DAY:          "fulfillmentDateNoLongerAvailable",
  ERR_DELIVERY_UNAVAILABLE:          "deliveryUnavailable",
  ERR_MISSING_DELIVERY_PLACE:        "deliveryPlaceRequired",
  ERR_INVALID_DELIVERY_PLACE:        "deliveryPlaceRequired",
};

function parseDbError(raw: string): { errorKey: string; detail?: string } {
  const colonIdx = raw.indexOf(":");
  const code   = colonIdx === -1 ? raw.trim() : raw.slice(0, colonIdx).trim();
  const detail = colonIdx === -1 ? undefined  : raw.slice(colonIdx + 1).trim();
  const errorKey = PG_ERROR_MAP[code] ?? "genericError";
  const full = detail ? `${code}:${detail}` : raw;
  if (full.includes("cardcom_") && full.includes("does not exist")) {
    return {
      errorKey: "cardPaymentSetupFailed",
      detail: "Run Supabase migration 20260613120000_order_cardcom.sql",
    };
  }
  if (full.includes("SUPABASE_SERVICE_ROLE_KEY") || full.includes("Missing Supabase server")) {
    return {
      errorKey: "cardPaymentSetupFailed",
      detail: "SUPABASE_SERVICE_ROLE_KEY missing on server",
    };
  }
  return { errorKey, detail: detail || raw };
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
      p_idempotency_key:           data.idempotencyKey,
      p_customer_locale:           data.customerLocale,
      p_fulfillment_date:          data.fulfillmentDate,
      p_fulfillment_day_of_week:   data.fulfillmentDayOfWeek,
      p_fulfillment_label:         data.fulfillmentLabel,
      p_delivery_place_id:         data.deliveryPlaceId ?? undefined,
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

    const orderId = res.order_id;
    const isCard = data.paymentMethod === "credit_card";

    if (isCard && isCardcomEnabled()) {
      try {
        const payment = await startCardcomPaymentForOrder(orderId);
        if (!payment.ok) {
          console.error("[createOrder] CardCom:", payment.message);
          return { ok: false, errorKey: "cardPaymentSetupFailed", detail: payment.message };
        }

        return {
          ok: true,
          orderId,
          idempotent: res.idempotent ?? false,
          requiresPayment: true,
          paymentRedirectUrl: payment.redirectUrl,
        };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[createOrder] CardCom exception:", message);
        return { ok: false, errorKey: "cardPaymentSetupFailed", detail: message };
      }
    }

    if (isCard && !isCardcomEnabled()) {
      return { ok: false, errorKey: "cardPaymentUnavailable" };
    }

    // Cash — send confirmation emails once the order is committed.
    if (!res.idempotent) {
      try {
        await dispatchOrderEmails(supabase, orderId, userId);
      } catch (e: unknown) {
        console.error("[createOrder] Order emails:", e);
      }
    }

    return { ok: true, orderId, idempotent: res.idempotent ?? false };
  });
