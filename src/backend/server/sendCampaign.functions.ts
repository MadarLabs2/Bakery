import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import { resolveIsAdmin } from "@/frontend/lib/resolveIsAdmin";

const sendCampaignInput = z.object({
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(50_000),
  discount_code: z.string().max(100).nullable(),
});

export type SendCampaignResult = {
  ok: boolean;
  inserted: boolean;
  sent: number;
  failed: number;
  subscriberCount: number;
  noMailProvider: boolean;
  error?: string;
  /** Last Resend API error message (helps debug domain / from / key issues). */
  resendLastError?: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainTextToHtml(text: string): string {
  return escapeHtml(text).replace(/\r\n|\r|\n/g, "<br />");
}

export const sendCampaignEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => sendCampaignInput.parse(raw))
  .handler(async ({ data, context }): Promise<SendCampaignResult> => {
    const ctx = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { supabase, userId } = ctx;

    if (!(await resolveIsAdmin(supabase, userId))) {
      return { ok: false, inserted: false, sent: 0, failed: 0, subscriberCount: 0, noMailProvider: false, error: "forbidden" };
    }

    const { subject, message, discount_code } = data;

    const { error: insertError } = await supabase.from("email_campaigns").insert({
      admin_id: userId,
      subject,
      message,
      discount_code,
    });

    if (insertError) {
      return {
        ok: false,
        inserted: false,
        sent: 0,
        failed: 0,
        subscriberCount: 0,
        noMailProvider: false,
        error: insertError.message,
      };
    }

    const { data: subscribers, error: subsError } = await supabase
      .from("email_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subsError) {
      return {
        ok: false,
        inserted: true,
        sent: 0,
        failed: 0,
        subscriberCount: 0,
        noMailProvider: false,
        error: subsError.message,
      };
    }

    const emails = (subscribers ?? [])
      .map((r) => r.email?.trim())
      .filter((e): e is string => Boolean(e && e.includes("@")));

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL?.trim();

    if (!apiKey || !from) {
      return {
        ok: true,
        inserted: true,
        sent: 0,
        failed: 0,
        subscriberCount: emails.length,
        noMailProvider: true,
      };
    }

    if (/https?:\/\//i.test(from) || !from.includes("@")) {
      return {
        ok: false,
        inserted: true,
        sent: 0,
        failed: 0,
        subscriberCount: emails.length,
        noMailProvider: false,
        error: "invalid_resend_from",
      };
    }

    const discountBlock = discount_code
      ? `<p><strong>קוד קופון / Coupon:</strong> ${escapeHtml(discount_code)}</p>`
      : "";

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5;">
  <h1 style="color: #1B4332;">${escapeHtml(subject)}</h1>
  <div>${plainTextToHtml(message)}</div>
  ${discountBlock}
  <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;" />
  <p style="font-size: 0.85rem; color: #666;">Al-nour Gluten-free Bakery</p>
</body>
</html>`;

    let sent = 0;
    let failed = 0;
    let resendLastError: string | undefined;

    for (const to of emails) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        failed += 1;
        try {
          const j = (await res.json()) as { message?: string };
          resendLastError = j.message ?? `${res.status} ${res.statusText}`;
        } catch {
          resendLastError = `${res.status} ${res.statusText}`;
        }
        continue;
      }
      sent += 1;
    }

    return {
      ok: true,
      inserted: true,
      sent,
      failed,
      subscriberCount: emails.length,
      noMailProvider: false,
      resendLastError,
    };
  });
