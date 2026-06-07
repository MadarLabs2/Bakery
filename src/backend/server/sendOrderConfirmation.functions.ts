import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { sendOrderConfirmationEmail } from "@/backend/services/emailService";

const orderConfirmationInput = z.object({
  orderId: z.string().uuid(),
});

export type SendOrderConfirmationResult = {
  ok: boolean;
  emailSent: boolean;
  error?: string;
};

export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => orderConfirmationInput.parse(raw))
  .handler(async ({ data, context }): Promise<SendOrderConfirmationResult> => {
    const ctx = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { supabase, userId } = ctx;
    const { orderId } = data;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", userId)
      .maybeSingle();

    if (orderError || !order) {
      return { ok: false, emailSent: false, error: orderError?.message ?? "order_not_found" };
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, product_price, total_price")
      .eq("order_id", orderId);

    if (itemsError) {
      return { ok: false, emailSent: false, error: itemsError.message };
    }

    let couponCode: string | null = null;
    if (order.coupon_id) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("code")
        .eq("id", order.coupon_id)
        .maybeSingle();
      couponCode = coupon?.code ?? null;
    }

    const deliveryLabel =
      order.delivery_method === "delivery"
        ? "Delivery"
        : order.delivery_method === "pickup"
          ? "Pickup"
          : String(order.delivery_method);

    const paymentLabel =
      order.payment_method === "cash"
        ? "Cash"
        : order.payment_method === "card"
          ? "Card"
          : String(order.payment_method);

    try {
      const result = await sendOrderConfirmationEmail(supabase, {
        orderId: order.id,
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        items: (items ?? []).map((i) => ({
          product_name: i.product_name,
          quantity: i.quantity,
          product_price: Number(i.product_price),
          total_price: Number(i.total_price),
        })),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discount_amount),
        deliveryFee: Number(order.delivery_fee),
        totalAmount: Number(order.total_amount),
        deliveryMethod: deliveryLabel,
        paymentMethod: paymentLabel,
        couponCode,
      });

      if (!result.ok) {
        console.error("[sendOrderConfirmation] Email failed:", result.error);
        return { ok: true, emailSent: false, error: result.error };
      }

      return { ok: true, emailSent: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "email_send_failed";
      console.error("[sendOrderConfirmation] Unexpected error:", msg);
      return { ok: true, emailSent: false, error: msg };
    }
  });
