import {
  confirmCardcomPayment,
  extractWebhookIds,
} from "@/backend/server/cardcomPayment.helpers";

function normalizePayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, unknown>;
}

export async function handleCardcomWebhook(raw: unknown): Promise<{ status: number; body: string }> {
  const payload = normalizePayload(raw);
  const { orderId, lowProfileId } = extractWebhookIds(payload);

  if (!orderId) {
    console.warn("[cardcom-webhook] missing ReturnValue", payload);
    return { status: 200, body: "OK" };
  }

  try {
    const result = await confirmCardcomPayment(orderId, lowProfileId);
    console.info("[cardcom-webhook]", orderId, lowProfileId, result);
  } catch (e) {
    console.error("[cardcom-webhook] error:", e);
    return { status: 500, body: "ERROR" };
  }

  return { status: 200, body: "OK" };
}
