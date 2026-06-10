import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { sendAdminNewOrderEmail } from "@/backend/services/emailService";

const input = z.object({
  orderId: z.string().uuid(),
});

export type SendAdminNewOrderResult = {
  ok: boolean;
  emailSent: boolean;
  error?: string;
};

/**
 * Sends a new-order notification to the admin inbox.
 * Called fire-and-forget from checkout.tsx after successful order creation.
 * Uses the customer's auth token to fetch order data securely;
 * all data is read server-side — nothing is accepted from the client.
 */
export const sendAdminNewOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => input.parse(raw))
  .handler(async ({ data, context }): Promise<SendAdminNewOrderResult> => {
    const { supabase, userId } = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { orderId } = data;

    // Fetch order using the customer's own session (verifies ownership via RLS)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", userId)
      .maybeSingle();

    if (orderError || !order) {
      return { ok: false, emailSent: false, error: "order_not_found" };
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity, product_price, total_price")
      .eq("order_id", orderId);

    if (itemsError) {
      return { ok: false, emailSent: false, error: "items_fetch_failed" };
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
      const result = await sendAdminNewOrderEmail({
        orderId:         order.id,
        orderNumber:     order.id.slice(0, 8).toUpperCase(),
        customerName:    order.customer_name,
        customerPhone:   order.customer_phone,
        customerEmail:   order.customer_email,
        items: (items ?? []).map((i) => ({
          product_name:  i.product_name,
          quantity:      i.quantity,
          product_price: Number(i.product_price),
          total_price:   Number(i.total_price),
        })),
        subtotal:        Number(order.subtotal),
        discountAmount:  Number(order.discount_amount),
        deliveryFee:     Number(order.delivery_fee),
        totalAmount:     Number(order.total_amount),
        deliveryMethod:  deliveryLabel,
        paymentMethod:   paymentLabel,
        deliveryAddress: order.delivery_address ?? null,
        notes:           order.notes ?? null,
      });

      if (!result.ok) {
        console.error("[sendAdminNewOrder] Email failed:", result.error);
        return { ok: true, emailSent: false, error: result.error };
      }

      return { ok: true, emailSent: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "email_send_failed";
      console.error("[sendAdminNewOrder] Unexpected error:", msg);
      return { ok: true, emailSent: false, error: msg };
    }
  });
