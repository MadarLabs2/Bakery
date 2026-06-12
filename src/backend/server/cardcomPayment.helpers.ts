import { supabaseAdmin } from "@/backend/db/client.server";
import { getCardcomConfig, isCardcomEnabled } from "@/backend/config/cardcom";
import {
  createCardcomLowProfile,
  getCardcomLpResult,
  isCardcomChargeSuccessful,
  toCardcomLanguage,
} from "@/backend/services/cardcomService";
import { dispatchOrderEmails } from "@/backend/server/orderEmail.helpers";

type OrderRow = {
  id: string;
  user_id: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_locale: string | null;
  cardcom_low_profile_id: string | null;
  cardcom_payment_fetched: boolean | null;
};

export function cardcomWebhookUrl(): string {
  const { appBaseUrl } = getCardcomConfig();
  return `${appBaseUrl}/api/cardcom-webhook`;
}

export function cardcomSuccessRedirectUrl(orderId: string): string {
  const { appBaseUrl } = getCardcomConfig();
  return `${appBaseUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&payment=card`;
}

export function cardcomFailedRedirectUrl(): string {
  const { appBaseUrl } = getCardcomConfig();
  return `${appBaseUrl}/checkout?payment=failed`;
}

export async function startCardcomPaymentForOrder(orderId: string): Promise<
  | { ok: true; redirectUrl: string; lowProfileId: string }
  | { ok: false; message: string }
> {
  try {
    if (!isCardcomEnabled()) {
      return { ok: false, message: "CardCom is not configured" };
    }

    const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, user_id, payment_method, payment_status, total_amount, customer_name, customer_email, customer_locale, cardcom_low_profile_id, cardcom_payment_fetched",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return { ok: false, message: error?.message ?? "Order not found" };
  }

  const row = order as OrderRow;
  if (row.payment_method !== "credit_card") {
    return { ok: false, message: "Not a card order" };
  }
  if (row.payment_status === "paid") {
    return { ok: false, message: "Already paid" };
  }

  const locale = toCardcomLanguage(row.customer_locale ?? "he");
  const productName = `Al-Nour #${row.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const created = await createCardcomLowProfile({
    amount: Number(row.total_amount),
    returnValue: row.id,
    language: locale,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    productName,
    webhookUrl: cardcomWebhookUrl(),
    successRedirectUrl: cardcomSuccessRedirectUrl(row.id),
    failedRedirectUrl: cardcomFailedRedirectUrl(),
  });

  if (!created.ok) {
    return { ok: false, message: created.message };
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      cardcom_low_profile_id: created.lowProfileId,
      cardcom_payment_fetched: false,
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("[cardcom] Failed to save LowProfileId:", updateError.message);
    return { ok: false, message: updateError.message };
  }

  return { ok: true, redirectUrl: created.url, lowProfileId: created.lowProfileId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[cardcom] startCardcomPaymentForOrder:", message);
    return { ok: false, message };
  }
}

export type ConfirmCardcomResult = "paid" | "failed" | "pending" | "not_found" | "already_paid";

export async function confirmCardcomPayment(
  orderId: string,
  lowProfileId?: string | null,
): Promise<ConfirmCardcomResult> {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, user_id, payment_method, payment_status, total_amount, cardcom_low_profile_id, cardcom_payment_fetched",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return "not_found";

  const row = order as OrderRow;
  if (row.payment_method !== "credit_card") return "not_found";
  if (row.payment_status === "paid") return "already_paid";

  const lpId = (lowProfileId ?? row.cardcom_low_profile_id)?.trim();
  if (!lpId) return "pending";

  if (row.cardcom_payment_fetched && row.payment_status === "failed") {
    return "failed";
  }

  const result = await getCardcomLpResult(lpId);
  if (!result) return "pending";

  const returnValue = String(result.ReturnValue ?? "").trim();
  if (returnValue && returnValue !== orderId) {
    console.error("[cardcom] ReturnValue mismatch:", returnValue, orderId);
    return "pending";
  }

  const success = isCardcomChargeSuccessful(result);
  const transactionId = result.TranzactionId ?? result.TransactionId;

  if (success) {
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        cardcom_low_profile_id: lpId,
        cardcom_transaction_id: transactionId != null ? String(transactionId) : null,
        cardcom_payment_fetched: true,
      })
      .eq("id", orderId)
      .eq("payment_status", "pending");

    if (updateError) {
      console.error("[cardcom] paid update failed:", updateError.message);
      return "pending";
    }

    try {
      await dispatchOrderEmails(supabaseAdmin, orderId, row.user_id);
    } catch (e) {
      console.error("[cardcom] emails after payment:", e);
    }

    return "paid";
  }

  await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "failed",
      cardcom_low_profile_id: lpId,
      cardcom_payment_fetched: true,
    })
    .eq("id", orderId)
    .eq("payment_status", "pending");

  return "failed";
}

export function extractWebhookIds(input: Record<string, unknown>): {
  orderId: string | null;
  lowProfileId: string | null;
} {
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const val = input[key];
      if (typeof val === "string" && val.trim()) return val.trim();
      if (typeof val === "number" && Number.isFinite(val)) return String(val);
    }
    return null;
  };

  return {
    orderId: pick("ReturnValue", "returnvalue", "Returnvalue"),
    lowProfileId: pick(
      "LowProfileId",
      "lowprofileid",
      "LowProfileCode",
      "lowprofilecode",
      "LpId",
    ),
  };
}
