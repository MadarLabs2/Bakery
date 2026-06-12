import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/backend/db/types";
import { confirmCardcomPayment } from "@/backend/server/cardcomPayment.helpers";

const inputSchema = z.object({
  orderId: z.string().uuid(),
});

export type ReleasePendingCardOrderResult =
  | { ok: true; released: true }
  | { ok: true; released: false; alreadyPaid: true }
  | { ok: false; errorKey: string; detail?: string };

export const releasePendingCardOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => inputSchema.parse(raw))
  .handler(async ({ data, context }): Promise<ReleasePendingCardOrderResult> => {
    const { supabase } = context as { supabase: SupabaseClient<Database> };

    const syncStatus = await confirmCardcomPayment(data.orderId);
    if (syncStatus === "paid" || syncStatus === "already_paid") {
      return { ok: true, released: false, alreadyPaid: true };
    }

    const { data: result, error } = await supabase.rpc("release_pending_card_order", {
      p_order_id: data.orderId,
    });

    if (error) {
      console.error("[releasePendingCardOrder]", error.message);
      return { ok: false, errorKey: "genericError", detail: error.message };
    }

    const row = result as {
      released?: boolean;
      already_paid?: boolean;
      reason?: string;
    } | null;

    if (row?.already_paid) {
      return { ok: true, released: false, alreadyPaid: true };
    }

    if (row?.released) {
      return { ok: true, released: true };
    }

    return { ok: false, errorKey: "genericError", detail: row?.reason ?? "not_released" };
  });
