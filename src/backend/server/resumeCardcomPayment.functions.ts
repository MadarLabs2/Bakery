import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { supabaseAdmin } from "@/backend/db/client.server";
import { startCardcomPaymentForOrder } from "@/backend/server/cardcomPayment.helpers";

const inputSchema = z.object({
  orderId: z.string().uuid(),
});

export type ResumeCardcomPaymentResult =
  | { ok: true; paymentRedirectUrl: string }
  | { ok: false; errorKey: string; detail?: string; alreadyPaid?: boolean };

export const resumeCardcomPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => inputSchema.parse(raw))
  .handler(async ({ data, context }): Promise<ResumeCardcomPaymentResult> => {
    const { userId } = context as { userId: string };

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, payment_method, payment_status")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!order || order.payment_method !== "credit_card") {
      return { ok: false, errorKey: "genericError" };
    }

    if (String(order.payment_status ?? "").toLowerCase() === "paid") {
      return { ok: false, errorKey: "genericError", alreadyPaid: true };
    }

    const payment = await startCardcomPaymentForOrder(data.orderId);
    if (!payment.ok) {
      return { ok: false, errorKey: "cardPaymentSetupFailed", detail: payment.message };
    }

    return { ok: true, paymentRedirectUrl: payment.redirectUrl };
  });
