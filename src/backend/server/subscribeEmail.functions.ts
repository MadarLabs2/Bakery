import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/backend/db/client.server";
import { checkRateLimit } from "@/backend/lib/rate-limit";
import { getClientIp } from "@/backend/lib/get-client-ip";

const subscribeInput = z.object({
  email: z.string().email().max(254),
  full_name: z.string().max(100).nullable().optional(),
  source: z.string().max(50).nullable().optional(),
  honeypot: z.string().optional().default(""), // bot trap — must arrive empty
});

export type SubscribeEmailResult = {
  ok: boolean;
  message: string;
};

/**
 * POST — public newsletter signup.
 *
 * Security properties:
 *  - Never reveals whether an email is already subscribed (opaque success)
 *  - Uses supabaseAdmin (service-role) so no RLS policy needed for public writes
 *  - IP-based rate limiting (5 per 15 min)
 *  - Honeypot field silently absorbs bot submissions
 *  - Reactivates unsubscribed addresses idempotently
 *  - Error messages never expose DB internals
 */
export const subscribeEmail = createServerFn({ method: "POST" })
  .validator((raw) => subscribeInput.parse(raw))
  .handler(async ({ data }): Promise<SubscribeEmailResult> => {
    // Honeypot filled → silently succeed; don't reveal detection to bots
    if (data.honeypot !== "") return { ok: true, message: "subscribed" };

    const ip = getClientIp();
    if (!checkRateLimit(`sub:ip:${ip}`, 5, 15 * 60 * 1000)) {
      return { ok: false, message: "genericError" };
    }

    const email = data.email.toLowerCase().trim();

    const { data: existing } = await supabaseAdmin
      .from("email_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        await supabaseAdmin
          .from("email_subscribers")
          .update({ is_active: true })
          .eq("id", existing.id);
      }
      // Always return the same success response — never reveal subscription state
      return { ok: true, message: "subscribed" };
    }

    const { error } = await supabaseAdmin.from("email_subscribers").insert({
      email,
      full_name: data.full_name?.trim() || null,
      source: data.source?.trim() || "homepage",
    });

    if (error) {
      // Unique violation means a concurrent insert won — treat as success
      if (error.code === "23505") {
        return { ok: true, message: "subscribed" };
      }
      console.error("[subscribeEmail] DB error:", error.code);
      return { ok: false, message: "genericError" };
    }

    return { ok: true, message: "subscribed" };
  });
