import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { confirmCardcomPayment } from "@/backend/server/cardcomPayment.helpers";
import { supabaseAdmin } from "@/backend/db/client.server";

const inputSchema = z.object({
  orderId: z.string().uuid(),
});

export type SyncCardcomPaymentResult =
  | { ok: true; status: "paid" | "pending" | "failed" | "already_paid" }
  | { ok: false; errorKey: string };

export const syncCardcomPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => inputSchema.parse(raw))
  .handler(async ({ data, context }): Promise<SyncCardcomPaymentResult> => {
    const { userId } = context as { userId: string };

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, payment_method")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!order || order.payment_method !== "credit_card") {
      return { ok: false, errorKey: "genericError" };
    }

    const status = await confirmCardcomPayment(data.orderId);
    if (status === "not_found") {
      return { ok: false, errorKey: "genericError" };
    }

    return { ok: true, status };
  });
