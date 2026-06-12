import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { supabaseAdmin } from "@/backend/db/client.server";
import { resolveIsAdmin } from "@/frontend/lib/resolveIsAdmin";
import { resendOrderConfirmationEmail } from "@/backend/services/emailService";

const input = z.object({
  orderId: z.string().uuid(),
});

export type ResendOrderConfirmationResult = {
  ok: boolean;
  emailSent: boolean;
  alreadySent: boolean; // informational: was there a prior 'sent' record
  error?: string;
};

/**
 * Admin-only action: resend the order confirmation email.
 *
 * Security:
 *  - Requires admin JWT
 *  - Fetches ALL order data server-side via supabaseAdmin
 *  - forceResend=true bypasses the duplicate-prevention check
 *  - Returns alreadySent as informational flag (not blocking)
 */
export const resendOrderConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => input.parse(raw))
  .handler(async ({ data, context }): Promise<ResendOrderConfirmationResult> => {
    const { supabase, userId } = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { orderId } = data;

    if (!(await resolveIsAdmin(supabase, userId))) {
      return { ok: false, emailSent: false, alreadySent: false, error: "forbidden" };
    }

    // Fetch full order data server-side
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return { ok: false, emailSent: false, alreadySent: false, error: "order_not_found" };
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("product_name, quantity, product_price, total_price")
      .eq("order_id", orderId);

    if (itemsError) {
      return { ok: false, emailSent: false, alreadySent: false, error: "items_fetch_failed" };
    }

    let couponCode: string | null = null;
    if (order.coupon_id) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("code")
        .eq("id", order.coupon_id)
        .maybeSingle();
      couponCode = coupon?.code ?? null;
    }

    const deliveryLabel =
      order.delivery_method === "delivery" ? "Delivery" :
      order.delivery_method === "pickup"   ? "Pickup"   :
      String(order.delivery_method);

    const paymentLabel =
      order.payment_method === "cash"        ? "Cash" :
      order.payment_method === "credit_card" ? "Card" :
      String(order.payment_method);

    try {
      const result = await resendOrderConfirmationEmail({
        orderId:        order.id,
        orderNumber:    order.id.slice(0, 8).toUpperCase(),
        customerName:   order.customer_name,
        customerEmail:  order.customer_email,
        customerPhone:  order.customer_phone,
        items: (items ?? []).map((i) => ({
          product_name:  i.product_name,
          quantity:      i.quantity,
          product_price: Number(i.product_price),
          total_price:   Number(i.total_price),
        })),
        subtotal:       Number(order.subtotal),
        discountAmount: Number(order.discount_amount),
        deliveryFee:    Number(order.delivery_fee),
        totalAmount:    Number(order.total_amount),
        deliveryMethod: deliveryLabel,
        paymentMethod:  paymentLabel,
        couponCode,
        locale:         order.customer_locale,
      });

      const alreadySent = result.alreadySent ?? false;

      if (!result.ok) {
        console.error("[resendOrderConfirmation] Email failed:", result.error);
        return { ok: false, emailSent: false, alreadySent, error: result.error };
      }

      return { ok: true, emailSent: true, alreadySent };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "email_send_failed";
      console.error("[resendOrderConfirmation] Unexpected error:", msg);
      return { ok: false, emailSent: false, alreadySent: false, error: msg };
    }
  });
