import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { sendOrderConfirmationEmail } from "@/backend/services/emailService";
import { loadOrderEmailPayload } from "@/backend/server/orderEmail.helpers";

const orderConfirmationInput = z.object({
  orderId: z.string().uuid(),
});

export type SendOrderConfirmationResult = {
  ok: boolean;
  emailSent: boolean;
  alreadySent?: boolean;
  error?: string;
};

export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => orderConfirmationInput.parse(raw))
  .handler(async ({ data, context }): Promise<SendOrderConfirmationResult> => {
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
      const result = await sendOrderConfirmationEmail(payload.confirmation);

      if (result.alreadySent) {
        return { ok: true, emailSent: false, alreadySent: true };
      }

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
