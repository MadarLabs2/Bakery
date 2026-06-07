import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/backend/db/types";

const subscribeInput = z.object({
  email: z.string().email().max(320),
  full_name: z.string().max(200).nullable().optional(),
  source: z.string().max(100).nullable().optional(),
});

export type SubscribeEmailResult = {
  ok: boolean;
  alreadySubscribed: boolean;
  message: string;
};

/**
 * POST /api/email/subscribe equivalent — public newsletter signup.
 * Validates email, inserts into email_subscribers, never throws to client.
 */
export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((raw) => subscribeInput.parse(raw))
  .handler(async ({ data }): Promise<SubscribeEmailResult> => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY =
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return { ok: false, alreadySubscribed: false, message: "Server configuration error" };
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email = data.email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("email_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (!existing.is_active) {
        await supabase.from("email_subscribers").update({ is_active: true }).eq("id", existing.id);
        return { ok: true, alreadySubscribed: false, message: "Resubscribed successfully" };
      }
      return { ok: true, alreadySubscribed: true, message: "Already subscribed" };
    }

    const { error } = await supabase.from("email_subscribers").insert({
      email,
      full_name: data.full_name?.trim() || null,
      source: data.source?.trim() || "homepage",
    });

    if (error) {
      if (error.code === "23505") {
        return { ok: true, alreadySubscribed: true, message: "Already subscribed" };
      }
      console.error("[subscribeEmail]", error.message);
      return { ok: false, alreadySubscribed: false, message: error.message };
    }

    return { ok: true, alreadySubscribed: false, message: "Subscribed successfully" };
  });
