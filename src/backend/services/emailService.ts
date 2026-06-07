/**
 * Server-only email service using Resend.
 *
 * PRODUCTION: Verify a custom domain in Resend (https://resend.com/domains) and set:
 *   RESEND_FROM_EMAIL=Al-Nour Bakery <orders@alnourbakery.com>
 *   or offers@alnourbakery.com
 *
 * DEVELOPMENT (no verified domain): Use Resend sandbox sender:
 *   RESEND_FROM_EMAIL=Al-Nour Bakery <onboarding@resend.dev>
 *   Emails can only be delivered to the address on your Resend account (ADMIN_EMAIL).
 *   Set EMAIL_TEST_MODE=false after domain verification to send to real customers.
 */
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/backend/db/types";
import {
  offerEmailTemplate,
  orderConfirmationTemplate,
  type OrderConfirmationData,
  type OfferEmailData,
} from "./emailTemplates";

export type EmailType = "order_confirmation" | "offer" | "welcome" | "password_reset";
export type EmailLogStatus = "sent" | "failed";

export type LogEmailParams = {
  supabase: SupabaseClient<Database>;
  recipientEmail: string;
  emailType: EmailType;
  subject: string;
  status: EmailLogStatus;
  campaignId?: string | null;
  orderId?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
};

/** True when using Resend sandbox or explicit test flag — limits recipients to ADMIN_EMAIL. */
export function isEmailTestMode(): boolean {
  if (process.env.EMAIL_TEST_MODE === "false") return false;
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  if (from.includes("@resend.dev")) return true;
  return process.env.EMAIL_TEST_MODE !== "false";
}

/** Resend account / admin inbox used in test mode. */
export function getTestRecipientEmail(): string {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.RESEND_TEST_EMAIL?.trim() ||
    ""
  );
}

/**
 * In test mode, redirect all deliveries to the Resend account email.
 * After domain verification, returns the intended recipient unchanged.
 */
export function resolveRecipient(intendedEmail: string, overrideTestEmail?: string): {
  to: string;
  testModeNote?: string;
} {
  if (!isEmailTestMode()) {
    return { to: intendedEmail.trim() };
  }
  const testTo = (overrideTestEmail || getTestRecipientEmail()).trim();
  if (!testTo) {
    return { to: intendedEmail.trim() };
  }
  if (testTo.toLowerCase() === intendedEmail.trim().toLowerCase()) {
    return { to: testTo };
  }
  return {
    to: testTo,
    testModeNote: `[Test mode] This email was intended for ${intendedEmail}. After verifying your domain in Resend, it will be sent directly to customers.`,
  };
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress(): string | null {
  let from = process.env.RESEND_FROM_EMAIL?.trim().replace(/^["']|["']$/g, "") ?? "";
  if (!from || /https?:\/\//i.test(from) || !from.includes("@")) {
    return null;
  }
  // Gmail/yahoo/etc. cannot be a Resend sender without domain verification.
  const emailPart = from.includes("<") ? from.slice(from.indexOf("<") + 1, from.indexOf(">")) : from;
  const domain = emailPart.split("@")[1]?.toLowerCase() ?? "";
  if (["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"].includes(domain)) {
    console.error(
      `[emailService] RESEND_FROM_EMAIL must not be ${emailPart}. Use: Al-Nour Bakery <onboarding@resend.dev>`,
    );
    return null;
  }
  return from;
}

export async function logEmailResult(params: LogEmailParams): Promise<void> {
  const { supabase, ...row } = params;
  const { error } = await supabase.from("email_logs").insert({
    campaign_id: row.campaignId ?? null,
    order_id: row.orderId ?? null,
    recipient_email: row.recipientEmail,
    email_type: row.emailType,
    subject: row.subject,
    status: row.status,
    provider_message_id: row.providerMessageId ?? null,
    error_message: row.errorMessage ?? null,
  });
  if (error) {
    console.error("[emailService] Failed to log email:", error.message);
  }
}

export type SendEmailResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  actualRecipient: string;
};

async function sendHtmlEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResult> {
  const from = getFromAddress();
  const resend = getResendClient();

  if (!resend || !from) {
    return {
      ok: false,
      error: "missing_resend_config",
      actualRecipient: to,
    };
  }

  try {
    const { data, error } = await resend.emails.send({ from, to: [to], subject, html });
    if (error) {
      return { ok: false, error: error.message, actualRecipient: to };
    }
    return { ok: true, providerMessageId: data?.id, actualRecipient: to };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown send error";
    console.error("[emailService] Resend error:", msg);
    return { ok: false, error: msg, actualRecipient: to };
  }
}

export async function sendOrderConfirmationEmail(
  supabase: SupabaseClient<Database>,
  orderData: OrderConfirmationData,
): Promise<SendEmailResult> {
  const { to, testModeNote } = resolveRecipient(orderData.customerEmail);
  const { subject, html } = orderConfirmationTemplate({ ...orderData, testModeNote });

  const result = await sendHtmlEmail(to, subject, html);

  await logEmailResult({
    supabase,
    recipientEmail: to,
    emailType: "order_confirmation",
    subject,
    status: result.ok ? "sent" : "failed",
    orderId: orderData.orderId,
    providerMessageId: result.providerMessageId,
    errorMessage: result.error ?? null,
  });

  return result;
}

export async function sendOfferEmail(
  supabase: SupabaseClient<Database>,
  params: OfferEmailData & { to: string; campaignId?: string | null; testRecipient?: string },
): Promise<SendEmailResult> {
  const { to: intendedTo, testModeNote } = resolveRecipient(params.to, params.testRecipient);
  const { subject, html } = offerEmailTemplate({
    subject: params.subject,
    message: params.message,
    couponCode: params.couponCode,
    discountPercent: params.discountPercent,
    testModeNote,
  });

  const result = await sendHtmlEmail(intendedTo, subject, html);

  await logEmailResult({
    supabase,
    recipientEmail: intendedTo,
    emailType: "offer",
    subject,
    status: result.ok ? "sent" : "failed",
    campaignId: params.campaignId ?? null,
    providerMessageId: result.providerMessageId,
    errorMessage: result.error ?? null,
  });

  return result;
}

export function getEmailConfigStatus(): {
  hasApiKey: boolean;
  hasFrom: boolean;
  testMode: boolean;
  testRecipient: string;
} {
  return {
    hasApiKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    hasFrom: Boolean(getFromAddress()),
    testMode: isEmailTestMode(),
    testRecipient: getTestRecipientEmail(),
  };
}
