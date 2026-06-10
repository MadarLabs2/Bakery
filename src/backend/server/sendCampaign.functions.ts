import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/backend/db/types";
import { requireSupabaseAuth } from "@/backend/db/auth-middleware";
import {
  getEmailConfigStatus,
  isEmailTestMode,
  sendOfferEmail,
} from "@/backend/services/emailService";
import { resolveIsAdmin } from "@/frontend/lib/resolveIsAdmin";

const sendOfferInput = z.object({
  subject: z.string().min(1).max(500),
  message: z.string().min(1).max(50_000),
  coupon_code: z.string().max(100).nullable(),
  discount_percent: z.number().min(0).max(100).nullable().optional(),
  /** Override test recipient; in test mode only this address receives mail. */
  test_recipient: z.string().email().optional(),
});

export type SendCampaignResult = {
  ok: boolean;
  inserted: boolean;
  campaignId?: string;
  sent: number;
  failed: number;
  subscriberCount: number;
  recipientsType: "test" | "all_subscribers";
  noMailProvider: boolean;
  testMode: boolean;
  error?: string;
  resendLastError?: string;
};

export const sendCampaignEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((raw) => sendOfferInput.parse(raw))
  .handler(async ({ data, context }): Promise<SendCampaignResult> => {
    const ctx = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };
    const { supabase, userId } = ctx;

    if (!(await resolveIsAdmin(supabase, userId))) {
      return {
        ok: false,
        inserted: false,
        sent: 0,
        failed: 0,
        subscriberCount: 0,
        recipientsType: "test",
        noMailProvider: false,
        testMode: isEmailTestMode(),
        error: "forbidden",
      };
    }

    const { subject, message, coupon_code, discount_percent, test_recipient } = data;
    const testMode = isEmailTestMode();
    const config = getEmailConfigStatus();

    // In test mode: never blast all subscribers — only the Resend account / admin email.
    let recipients: string[] = [];
    let recipientsType: "test" | "all_subscribers" = "test";

    if (testMode) {
      const testEmail = (test_recipient || config.testRecipient).trim();
      if (testEmail) recipients = [testEmail];
    } else {
      recipientsType = "all_subscribers";
      const { data: subscribers, error: subsError } = await supabase
        .from("email_subscribers")
        .select("email")
        .eq("is_active", true);

      if (subsError) {
        return {
          ok: false,
          inserted: false,
          sent: 0,
          failed: 0,
          subscriberCount: 0,
          recipientsType,
          noMailProvider: false,
          testMode,
          error: subsError.message,
        };
      }

      recipients = (subscribers ?? [])
        .map((r) => r.email?.trim())
        .filter((e): e is string => Boolean(e && e.includes("@")));
    }

    const { data: campaign, error: insertError } = await supabase
      .from("email_campaigns")
      .insert({
        admin_id: userId,
        subject,
        message,
        discount_code: coupon_code,
        discount_percent: discount_percent ?? null,
        recipients_type: recipientsType,
        recipients_count: recipients.length,
        status: "draft",
      })
      .select("id")
      .single();

    if (insertError || !campaign) {
      return {
        ok: false,
        inserted: false,
        sent: 0,
        failed: 0,
        subscriberCount: recipients.length,
        recipientsType,
        noMailProvider: false,
        testMode,
        error: insertError?.message ?? "insert_failed",
      };
    }

    const campaignId = campaign.id;

    if (!config.hasApiKey || !config.hasFrom) {
      await supabase.from("email_campaigns").update({ status: "draft" }).eq("id", campaignId);
      return {
        ok: true,
        inserted: true,
        campaignId,
        sent: 0,
        failed: 0,
        subscriberCount: recipients.length,
        recipientsType,
        noMailProvider: true,
        testMode,
      };
    }

    if (recipients.length === 0) {
      await supabase
        .from("email_campaigns")
        .update({ status: "sent", sent_at: new Date().toISOString(), recipients_count: 0 })
        .eq("id", campaignId);
      return {
        ok: true,
        inserted: true,
        campaignId,
        sent: 0,
        failed: 0,
        subscriberCount: 0,
        recipientsType,
        noMailProvider: false,
        testMode,
      };
    }

    let sent = 0;
    let failed = 0;
    let resendLastError: string | undefined;

    for (const to of recipients) {
      const result = await sendOfferEmail({
        to,
        subject,
        message,
        couponCode: coupon_code,
        discountPercent: discount_percent ?? null,
        campaignId,
        testRecipient: test_recipient || config.testRecipient,
      });

      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        resendLastError = result.error;
      }
    }

    const finalStatus = failed === recipients.length ? "failed" : "sent";
    await supabase
      .from("email_campaigns")
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        recipients_count: sent,
      })
      .eq("id", campaignId);

    return {
      ok: true,
      inserted: true,
      campaignId,
      sent,
      failed,
      subscriberCount: recipients.length,
      recipientsType,
      noMailProvider: false,
      testMode,
      resendLastError,
    };
  });

export const getEmailCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as {
      supabase: SupabaseClient<Database>;
      userId: string;
    };

    if (!(await resolveIsAdmin(ctx.supabase, ctx.userId))) {
      return { ok: false as const, error: "forbidden", campaigns: [] };
    }

    const { data, error } = await ctx.supabase
      .from("email_campaigns")
      .select(
        "id, subject, message, discount_code, discount_percent, recipients_type, recipients_count, status, sent_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { ok: false as const, error: error.message, campaigns: [] };
    }

    return { ok: true as const, campaigns: data ?? [] };
  });
