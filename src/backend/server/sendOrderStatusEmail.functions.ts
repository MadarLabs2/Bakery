import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { supabaseAdmin } from "@/backend/db/client.server";
import { resolveIsAdmin } from "@/frontend/lib/resolveIsAdmin";
import { sendOrderStatusEmail, ORDER_STATUS_EMAIL_TYPE } from "@/backend/services/emailService";

const input = z.object({
  orderId:   z.string().uuid(),
  newStatus: z.string().min(1).max(50),
});

export type SendOrderStatusEmailResult = {
  ok: boolean;
  emailSent: boolean;
  alreadySent?: boolean;
  noEmail?: boolean;   // true when this status has no customer email
  error?: string;
};

/**
 * Sends a customer status-change email when the admin updates an order status.
 * Called fire-and-forget from admin.orders.tsx.
 *
 * Security:
 *  - Requires admin JWT via requireSupabaseAuth
 *  - Fetches ALL order data server-side using supabaseAdmin
 *  - No recipient, prices, or content accepted from the frontend
 */
export const sendOrderStatusEmailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => input.parse(raw))
  .handler(async ({ data, context }): Promise<SendOrderStatusEmailResult> => {
    const { supabase, userId } = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { orderId, newStatus } = data;

    // Admin guard
    if (!(await resolveIsAdmin(supabase, userId))) {
      return { ok: false, emailSent: false, error: "forbidden" };
    }

    // Fast-exit for statuses that carry no customer email
    if (!ORDER_STATUS_EMAIL_TYPE[newStatus]) {
      return { ok: true, emailSent: false, noEmail: true };
    }

    // Fetch order data server-side via service role
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, customer_email, delivery_method, delivery_address")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return { ok: false, emailSent: false, error: "order_not_found" };
    }

    try {
      const result = await sendOrderStatusEmail({
        orderId:         order.id,
        orderNumber:     order.id.slice(0, 8).toUpperCase(),
        customerName:    order.customer_name,
        customerEmail:   order.customer_email,
        deliveryMethod:  order.delivery_method ?? "pickup",
        deliveryAddress: order.delivery_address ?? null,
        status:          newStatus,
      });

      if (result.noEmail)     return { ok: true, emailSent: false, noEmail: true };
      if (result.alreadySent) return { ok: true, emailSent: false, alreadySent: true };
      if (!result.ok)         return { ok: true, emailSent: false, error: result.error };

      return { ok: true, emailSent: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "email_send_failed";
      console.error("[sendOrderStatusEmailFn] Unexpected error:", msg);
      return { ok: true, emailSent: false, error: msg };
    }
  });
