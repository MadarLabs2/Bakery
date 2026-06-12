import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { sendAdminNewOrderEmail } from "@/backend/services/emailService";
import { loadOrderEmailPayload } from "@/backend/server/orderEmail.helpers";

const input = z.object({
  orderId: z.string().uuid(),
});

export type SendAdminNewOrderResult = {
  ok: boolean;
  emailSent: boolean;
  error?: string;
};

export const sendAdminNewOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => input.parse(raw))
  .handler(async ({ data, context }): Promise<SendAdminNewOrderResult> => {
    const { supabase, userId } = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { orderId } = data;

    const payload = await loadOrderEmailPayload(supabase, orderId, userId);
    if (!payload) {
      return { ok: false, emailSent: false, error: "order_not_found" };
    }

    try {
      const result = await sendAdminNewOrderEmail(payload.admin);

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
