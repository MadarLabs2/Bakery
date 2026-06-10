/**
 * Server-only email service using Resend.
 *
 * PRODUCTION: Verify a custom domain in Resend (https://resend.com/domains) and set:
 *   RESEND_FROM_EMAIL=Al-Nour Bakery <orders@alnourbakery.com>
 *   EMAIL_TEST_MODE=false
 *   APP_BASE_URL=https://yoursite.com
 *
 * DEVELOPMENT (no verified domain): Use Resend sandbox sender:
 *   RESEND_FROM_EMAIL=Al-Nour Bakery <onboarding@resend.dev>
 *   Emails can only be delivered to the address on your Resend account (ADMIN_EMAIL).
 *   Set EMAIL_TEST_MODE=false after domain verification to send to real customers.
 */
import { Resend } from "resend";
import { supabaseAdmin } from "@/backend/db/client.server";
import {
  offerEmailTemplate,
  orderConfirmationTemplate,
  adminNewOrderTemplate,
  orderStatusTemplate,
  type OrderConfirmationData,
  type OfferEmailData,
  type AdminOrderEmailData,
  type OrderStatusEmailData,
} from "./emailTemplates";

export type EmailType =
  | "order_confirmation"
  | "order_status_confirmed"
  | "order_status_preparing"
  | "order_status_ready"
  | "order_status_delivered"
  | "order_status_cancelled"
  | "admin_new_order"
  | "offer"
  | "welcome"
  | "password_reset";

export type EmailLogStatus = "pending" | "processing" | "sent" | "failed";

/** Maps order status string → EmailType. Returns null for statuses with no email. */
export const ORDER_STATUS_EMAIL_TYPE: Partial<Record<string, EmailType>> = {
  confirmed:        "order_status_confirmed",
  preparing:        "order_status_preparing",
  ready:            "order_status_ready",
  out_for_delivery: "order_status_ready",
  completed:        "order_status_delivered",
  cancelled:        "order_status_cancelled",
};

// ─── Config helpers ───────────────────────────────────────────────────────────

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

// ─── Low-level send ───────────────────────────────────────────────────────────

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
    return { ok: false, error: "missing_resend_config", actualRecipient: to };
  }

  try {
    const { data, error } = await resend.emails.send({ from, to: [to], subject, html });
    if (error) {
      return { ok: false, error: error.message, actualRecipient: to };
    }
    return { ok: true, providerMessageId: data?.id, actualRecipient: to };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown_send_error";
    console.error("[emailService] Resend error:", msg);
    return { ok: false, error: msg, actualRecipient: to };
  }
}

// ─── Email log helpers ────────────────────────────────────────────────────────

export type LogEmailParams = {
  recipientEmail: string;
  emailType: EmailType;
  subject: string;
  status: EmailLogStatus;
  campaignId?: string | null;
  orderId?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  attemptCount?: number;
  sentAt?: string | null;
};

/** Insert a new log row. Used for offer/campaign emails and legacy callers. */
export async function logEmailResult(params: LogEmailParams): Promise<void> {
  const { error } = await supabaseAdmin.from("email_logs").insert({
    campaign_id:         params.campaignId ?? null,
    order_id:            params.orderId ?? null,
    recipient_email:     params.recipientEmail,
    email_type:          params.emailType,
    subject:             params.subject,
    status:              params.status,
    provider_message_id: params.providerMessageId ?? null,
    error_message:       params.errorMessage ?? null,
    attempt_count:       params.attemptCount ?? 1,
    sent_at:             params.sentAt ?? null,
  });
  if (error) {
    console.error("[emailService] Failed to log email:", error.code);
  }
}

/**
 * Core helper for order-related emails.
 *
 * - Checks for an existing 'sent' log record to prevent duplicate sends
 *   (unless `forceResend` is true — used for admin resend action).
 * - Sends the email synchronously via Resend.
 * - Updates the most-recent failed log row (incrementing attempt_count)
 *   or inserts a fresh row.
 * - Returns { ok, alreadySent } so callers can give accurate UI feedback.
 */
async function sendAndLogOrderEmail(opts: {
  orderId: string;
  emailType: EmailType;
  recipientEmail: string;
  subject: string;
  html: string;
  forceResend?: boolean;
}): Promise<SendEmailResult & { alreadySent: boolean }> {
  const { orderId, emailType, recipientEmail, subject, html, forceResend = false } = opts;

  // ── Duplicate-send guard ──────────────────────────────────────────────────
  if (!forceResend) {
    const { data: sent } = await supabaseAdmin
      .from("email_logs")
      .select("id")
      .eq("order_id", orderId)
      .eq("email_type", emailType)
      .eq("status", "sent")
      .maybeSingle();

    if (sent) {
      return { ok: true, alreadySent: true, actualRecipient: recipientEmail };
    }
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  const result = await sendHtmlEmail(recipientEmail, subject, html);
  const now = new Date().toISOString();

  // ── Log: update existing (any status) or insert new ───────────────────────
  const { data: existing } = await supabaseAdmin
    .from("email_logs")
    .select("id, attempt_count")
    .eq("order_id", orderId)
    .eq("email_type", emailType)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("email_logs")
      .update({
        status:              result.ok ? "sent" : "failed",
        attempt_count:       existing.attempt_count + 1,
        sent_at:             result.ok ? now : null,
        provider_message_id: result.providerMessageId ?? null,
        error_message:       result.ok ? null : (result.error ?? null),
      })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin.from("email_logs").insert({
      order_id:            orderId,
      recipient_email:     recipientEmail,
      email_type:          emailType,
      subject,
      status:              result.ok ? "sent" : "failed",
      attempt_count:       1,
      sent_at:             result.ok ? now : null,
      provider_message_id: result.providerMessageId ?? null,
      error_message:       result.ok ? null : (result.error ?? null),
    });
  }

  return { ...result, alreadySent: false };
}

// ─── Public send functions ────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  orderData: OrderConfirmationData,
): Promise<SendEmailResult & { alreadySent: boolean }> {
  const { to, testModeNote } = resolveRecipient(orderData.customerEmail);
  const { subject, html } = orderConfirmationTemplate({ ...orderData, testModeNote });
  return sendAndLogOrderEmail({
    orderId: orderData.orderId,
    emailType: "order_confirmation",
    recipientEmail: to,
    subject,
    html,
  });
}

export async function resendOrderConfirmationEmail(
  orderData: OrderConfirmationData,
): Promise<SendEmailResult & { alreadySent: boolean }> {
  const { to, testModeNote } = resolveRecipient(orderData.customerEmail);
  const { subject, html } = orderConfirmationTemplate({ ...orderData, testModeNote });
  return sendAndLogOrderEmail({
    orderId: orderData.orderId,
    emailType: "order_confirmation",
    recipientEmail: to,
    subject,
    html,
    forceResend: true,
  });
}

export async function sendAdminNewOrderEmail(
  orderData: AdminOrderEmailData & { orderId: string },
): Promise<SendEmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) {
    console.error("[emailService] ADMIN_EMAIL not set — skipping admin new-order notification");
    return { ok: false, error: "missing_admin_email", actualRecipient: "" };
  }

  const { subject, html } = adminNewOrderTemplate(orderData);
  const result = await sendHtmlEmail(adminEmail, subject, html);

  // Log without dedup — admin always wants new order notifications
  await logEmailResult({
    orderId:             orderData.orderId,
    recipientEmail:      adminEmail,
    emailType:           "admin_new_order",
    subject,
    status:              result.ok ? "sent" : "failed",
    providerMessageId:   result.providerMessageId ?? null,
    errorMessage:        result.ok ? null : (result.error ?? null),
    sentAt:              result.ok ? new Date().toISOString() : null,
  });

  return result;
}

export async function sendOrderStatusEmail(
  statusData: OrderStatusEmailData & { orderId: string },
): Promise<SendEmailResult & { alreadySent: boolean; noEmail: boolean }> {
  const emailType = ORDER_STATUS_EMAIL_TYPE[statusData.status];
  if (!emailType) {
    return { ok: true, alreadySent: false, noEmail: true, actualRecipient: "" };
  }

  const { to, testModeNote } = resolveRecipient(statusData.customerEmail);
  const { subject, html } = orderStatusTemplate({ ...statusData, testModeNote });

  const result = await sendAndLogOrderEmail({
    orderId: statusData.orderId,
    emailType,
    recipientEmail: to,
    subject,
    html,
  });

  return { ...result, noEmail: false };
}

export async function sendOfferEmail(
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
    recipientEmail:    intendedTo,
    emailType:         "offer",
    subject,
    status:            result.ok ? "sent" : "failed",
    campaignId:        params.campaignId ?? null,
    providerMessageId: result.providerMessageId ?? null,
    errorMessage:      result.ok ? null : (result.error ?? null),
    sentAt:            result.ok ? new Date().toISOString() : null,
  });

  return result;
}
