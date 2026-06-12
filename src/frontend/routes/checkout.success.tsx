import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Package } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { syncCardcomPayment } from "@/backend/server/syncCardcomPayment.functions";
import { useAuth } from "@/frontend/lib/auth";
import { useI18n } from "@/frontend/lib/i18n";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { BAKERY_PICKUP_ADDRESS } from "@/frontend/lib/checkoutDelivery";
import { PENDING_CARD_ORDER_STORAGE_KEY } from "@/frontend/lib/orderPayment";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
    payment: typeof search.payment === "string" ? search.payment : "",
  }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const { user, loading: authLoading, session } = useAuth();
  const syncPaymentFn = useServerFn(syncCardcomPayment);
  const { orderId, payment } = Route.useSearch();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSyncing, setPaymentSyncing] = useState(payment === "card");

  const loadOrder = async () => {
    if (!user || !orderId) return null;
    const { data } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    return data;
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      let data = await loadOrder();
      if (cancelled) return;

      const isCardOrder =
        data?.payment_method === "credit_card" || data?.payment_method === "card";
      const needsSync =
        isCardOrder && String(data?.payment_status ?? "pending") !== "paid";

      if (needsSync && session?.access_token) {
        setPaymentSyncing(true);
        for (let attempt = 0; attempt < 8; attempt++) {
          if (cancelled) return;
          try {
            const sync = await syncPaymentFn({
              data: { orderId },
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (sync.ok && (sync.status === "paid" || sync.status === "already_paid")) {
              data = await loadOrder();
              break;
            }
            if (sync.ok && sync.status === "failed") {
              break;
            }
          } catch {
            /* retry */
          }
          await new Promise((r) => setTimeout(r, 1500));
          data = await loadOrder();
        }
        setPaymentSyncing(false);
      }

      data = await loadOrder();

      if (!cancelled) {
        setOrder(data);
        setLoading(false);

        const isCardOrder =
          data?.payment_method === "credit_card" || data?.payment_method === "card";
        const paid = String(data?.payment_status ?? "").toLowerCase() === "paid";

        if (isCardOrder && paid) {
          try {
            sessionStorage.removeItem(PENDING_CARD_ORDER_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }

        if (isCardOrder && !paid) {
          nav({
            to: "/checkout",
            search: {
              payment: String(data?.payment_status ?? "").toLowerCase() === "failed" ? "failed" : "pending",
              orderId,
            },
            replace: true,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, orderId, session?.access_token, syncPaymentFn, payment, nav]);

  const shortId = orderId ? orderId.replace(/-/g, "").slice(0, 8).toUpperCase() : "—";
  const isPickup = String(order?.delivery_method ?? "").toLowerCase() === "pickup";
  const isCard = order?.payment_method === "credit_card" || order?.payment_method === "card";
  const paymentStatus = String(order?.payment_status ?? "pending");
  const paymentPending = isCard && paymentStatus === "pending";
  const paymentFailed = isCard && paymentStatus === "failed";

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-[#faf8f4] to-white px-4 py-12 sm:py-16">
      <div className="container mx-auto max-w-lg">
        <div className="rounded-2xl border border-[#1B4332]/15 bg-white p-6 text-center shadow-lg sm:p-10">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              paymentFailed
                ? "bg-destructive/10 text-destructive"
                : "bg-[#1B4332]/10 text-[#1B4332]"
            }`}
          >
            {paymentSyncing || paymentPending ? (
              <Loader2 className="h-9 w-9 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="h-9 w-9" aria-hidden />
            )}
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-[#1B4332] sm:text-3xl">
            {paymentFailed
              ? t("cardPaymentFailed")
              : paymentSyncing || paymentPending
                ? t("cardPaymentPending")
                : isCard && paymentStatus === "paid"
                  ? t("cardPaymentConfirmed")
                  : t("orderConfirmationTitle")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {paymentFailed
              ? t("cardPaymentFailed")
              : paymentSyncing || paymentPending
                ? t("cardPaymentPending")
                : t("orderConfirmationThanks")}
          </p>

          {loading ? (
            <div className="mt-8 space-y-3">
              <Skeleton className="mx-auto h-4 w-48" />
              <Skeleton className="mx-auto h-4 w-32" />
            </div>
          ) : order ? (
            <div className="mt-8 space-y-3 rounded-xl border border-[#1B4332]/10 bg-[#faf8f4]/50 p-4 text-sm text-start">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("orderNumberLabel")}</span>
                <span className="font-mono font-semibold text-[#1B4332]" dir="ltr">
                  #{shortId}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("total")}</span>
                <span className="font-display text-lg font-bold text-[#1B4332]" dir="ltr">
                  ₪{Number(order.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("checkoutSummaryReceiving")}</span>
                <span className="font-medium text-end">
                  {isPickup ? t("pickupOptionTitle") : t("deliveryOptionTitle")}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t("paymentMethod")}</span>
                <span className="font-medium">
                  {isCard ? t("creditCard") : t("cashOnDeliveryTitle")}
                </span>
              </div>
              {isPickup ? (
                <p className="border-t border-[#1B4332]/10 pt-2 text-xs text-muted-foreground">
                  {BAKERY_PICKUP_ADDRESS}
                </p>
              ) : order.delivery_address ? (
                <p className="border-t border-[#1B4332]/10 pt-2 text-xs whitespace-pre-wrap text-muted-foreground">
                  {order.delivery_address}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">{t("orderConfirmationThanks")}</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {!paymentFailed ? (
              <Button asChild size="lg" className="h-11">
                <Link to="/orders">
                  <Package className="me-2 h-4 w-4" aria-hidden />
                  {t("viewMyOrders")}
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-11">
                <Link to="/checkout">{t("checkout")}</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="h-11 border-[#1B4332]/30">
              <Link to="/products">{t("continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
