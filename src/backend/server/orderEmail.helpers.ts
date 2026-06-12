import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/backend/db/types";
import type { OrderConfirmationData, AdminOrderEmailData } from "@/backend/services/emailTemplates";
import { normalizeEmailLocale } from "@/backend/services/emailTemplates";
import { sendAdminNewOrderEmail, sendOrderConfirmationEmail } from "@/backend/services/emailService";

export async function loadOrderEmailPayload(
  supabase: SupabaseClient<Database>,
  orderId: string,
  userId: string,
): Promise<{ confirmation: OrderConfirmationData; admin: AdminOrderEmailData & { orderId: string } } | null> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (orderError || !order) return null;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, quantity, product_price, total_price")
    .eq("order_id", orderId);

  if (itemsError) return null;

  let couponCode: string | null = null;
  if (order.coupon_id) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("code")
      .eq("id", order.coupon_id)
      .maybeSingle();
    couponCode = coupon?.code ?? null;
  }

  const deliveryLabel =
    order.delivery_method === "delivery" ? "Delivery" :
    order.delivery_method === "pickup"   ? "Pickup"   :
    String(order.delivery_method);

  const paymentLabel =
    order.payment_method === "cash"        ? "Cash" :
    order.payment_method === "credit_card" ? "Card" :
    String(order.payment_method);

  const lineItems = (items ?? []).map((i) => ({
    product_name:  i.product_name,
    quantity:      i.quantity,
    product_price: Number(i.product_price),
    total_price:   Number(i.total_price),
  }));

  const base = {
    orderId:         order.id,
    orderNumber:     order.id.slice(0, 8).toUpperCase(),
    customerName:    order.customer_name,
    customerPhone:   order.customer_phone,
    customerEmail:   order.customer_email,
    items:           lineItems,
    subtotal:        Number(order.subtotal),
    discountAmount:  Number(order.discount_amount),
    deliveryFee:     Number(order.delivery_fee),
    totalAmount:     Number(order.total_amount),
    deliveryMethod:  deliveryLabel,
    paymentMethod:   paymentLabel,
  };

  return {
    confirmation: { ...base, couponCode, locale: normalizeEmailLocale(order.customer_locale) },
    admin: {
      ...base,
      orderId: order.id,
      deliveryAddress: order.delivery_address ?? null,
      notes:           order.notes ?? null,
    },
  };
}

/** Send customer + admin order emails on the server (reliable — not cancelled by client navigation). */
export async function dispatchOrderEmails(
  supabase: SupabaseClient<Database>,
  orderId: string,
  userId: string,
): Promise<void> {
  const payload = await loadOrderEmailPayload(supabase, orderId, userId);
  if (!payload) {
    console.error("[dispatchOrderEmails] Could not load order payload:", orderId);
    return;
  }

  const [confirmation, admin] = await Promise.allSettled([
    sendOrderConfirmationEmail(payload.confirmation),
    sendAdminNewOrderEmail(payload.admin),
  ]);

  if (confirmation.status === "rejected") {
    console.error("[dispatchOrderEmails] Confirmation rejected:", confirmation.reason);
  } else if (confirmation.value.alreadySent) {
    console.info(
      "[dispatchOrderEmails] Confirmation skipped (already sent to",
      confirmation.value.actualRecipient + ")",
    );
  } else if (!confirmation.value.ok) {
    console.error("[dispatchOrderEmails] Confirmation failed:", confirmation.value.error);
  } else {
    console.info(
      "[dispatchOrderEmails] Confirmation sent to",
      confirmation.value.actualRecipient,
    );
  }

  if (admin.status === "rejected") {
    console.error("[dispatchOrderEmails] Admin rejected:", admin.reason);
  } else if (!admin.value.ok) {
    console.error("[dispatchOrderEmails] Admin failed:", admin.value.error);
  }
}
