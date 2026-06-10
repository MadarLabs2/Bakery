import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/backend/db/client.server";
import { checkRateLimit } from "@/backend/lib/rate-limit";
import { getClientIp } from "@/backend/lib/get-client-ip";

const contactSchema = z.object({
  fullName: z.string().min(1).max(100).trim(),
  email: z
    .string()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase().trim()),
  phone: z.string().max(20).trim().optional().nullable(),
  message: z.string().min(10).max(2000).trim(),
  honeypot: z.string().optional().default(""), // bot trap — must arrive empty
});

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; errorKey: "rateLimited" | "validationError" | "genericError" };

export const submitContact = createServerFn({ method: "POST" })
  .validator((raw) => contactSchema.parse(raw))
  .handler(async ({ data }): Promise<SubmitContactResult> => {
    // Honeypot filled → silently succeed; don't reveal detection to bots
    if (data.honeypot !== "") return { ok: true };

    const ip = getClientIp();

    // 5 submissions per 15 min per IP
    if (!checkRateLimit(`contact:ip:${ip}`, 5, 15 * 60 * 1000)) {
      return { ok: false, errorKey: "rateLimited" };
    }
    // 3 submissions per hour per email (normalized by the Zod transform above)
    if (!checkRateLimit(`contact:email:${data.email}`, 3, 60 * 60 * 1000)) {
      return { ok: false, errorKey: "rateLimited" };
    }

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone?.trim() || null,
      message: data.message,
    });

    if (error) {
      // Log only the error code — never log message content or the sender's email
      console.error("[submitContact] DB error:", error.code);
      return { ok: false, errorKey: "genericError" };
    }

    return { ok: true };
  });
