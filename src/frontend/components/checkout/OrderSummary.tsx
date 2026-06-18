import { Package } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import type { CartItem } from "@/frontend/lib/cart";
import { resolveImage } from "@/frontend/lib/images";
import { BAKERY_PICKUP_ADDRESS } from "@/frontend/lib/checkoutDelivery";
import type { DeliveryMethod } from "@/frontend/lib/checkoutDelivery";
import type { PaymentMethod } from "./PaymentMethodSelector";
import { Button } from "@/frontend/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  scheduledDateLabel?: string | null;
  submitting: boolean;
  onPlaceOrder: () => void;
  className?: string;
};

export function OrderSummary({
  items,
  subtotal,
  discount,
  deliveryFee,
  total,
  deliveryMethod,
  paymentMethod,
  scheduledDateLabel,
  submitting,
  onPlaceOrder,
  className,
}: OrderSummaryProps) {
  const { t, lang } = useI18n();

  const receivingLabel =
    deliveryMethod === "delivery" ? t("deliveryOptionTitle") : t("pickupOptionTitle");
  const paymentLabel = paymentMethod === "cash" ? t("cashOnDeliveryTitle") : t("creditCard");

  return (
    <aside
      className={cn(
        "rounded-2xl border border-[#1B4332]/15 bg-gradient-to-b from-white to-[#faf8f4]/80 p-5 shadow-lg sm:p-6 lg:sticky lg:top-24 lg:self-start",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2 border-b border-[#1B4332]/10 pb-4">
        <Package className="h-5 w-5 text-[#1B4332]" aria-hidden />
        <h2 className="font-display text-xl font-bold text-[#1B4332]">{t("orderSummaryTitle")}</h2>
      </div>

      <ul className="max-h-[min(40vh,16rem)] space-y-3 overflow-y-auto pr-1">
        {items.map((i) => {
          const thumb = i.product.image_url ? resolveImage(i.product.image_url) : null;
          const lineTotal = i.quantity * Number(i.product.price);
          return (
            <li key={i.id} className="flex gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-stone-200/80 bg-[#faf8f4]">
                {thumb ? (
                  <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-400">
                    <Package className="h-5 w-5" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                  {pickName(i.product, lang)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                  {i.quantity} × ₪{Number(i.product.price).toFixed(2)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[#1B4332]" dir="ltr">
                ₪{lineTotal.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-2 rounded-xl border border-[#1B4332]/10 bg-white/60 px-3 py-2.5 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{t("checkoutSummaryReceiving")}</span>
          <span className="text-end font-medium text-[#1B4332]">{receivingLabel}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{t("paymentMethod")}</span>
          <span className="text-end font-medium">{paymentLabel}</span>
        </div>
        {scheduledDateLabel ? (
          <div className="flex justify-between gap-2 border-t border-[#1B4332]/10 pt-2">
            <span className="text-muted-foreground">{t("checkoutSummaryScheduledDate")}</span>
            <span className="text-end text-xs font-medium leading-snug text-[#1B4332] sm:text-sm">
              {scheduledDateLabel}
            </span>
          </div>
        ) : null}
        {deliveryMethod === "pickup" ? (
          <p className="border-t border-[#1B4332]/10 pt-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{t("checkoutSummaryPickupAddress")}: </span>
            {BAKERY_PICKUP_ADDRESS}
          </p>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 border-t border-[#1B4332]/10 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="tabular-nums font-medium" dir="ltr">
            ₪{subtotal.toFixed(2)}
          </span>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-[#2f6a4f]">
            <span>{t("discount")}</span>
            <span className="tabular-nums font-medium" dir="ltr">
              −₪{discount.toFixed(2)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("deliveryFeeLabel")}</span>
          <span className="tabular-nums font-medium" dir="ltr">
            ₪{deliveryFee.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between border-t border-[#1B4332]/15 pt-3 font-display text-xl font-bold text-[#1B4332]">
          <span>{t("total")}</span>
          <span dir="ltr">₪{total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-5 h-12 w-full text-base font-semibold shadow-md"
        onClick={onPlaceOrder}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="me-2 h-5 w-5 animate-spin" aria-hidden />
            {t("placingOrder")}
          </>
        ) : (
          t("placeOrder")
        )}
      </Button>

      <div className="mt-4 flex flex-col gap-2 text-center text-sm sm:flex-row sm:justify-center">
        <Link to="/cart" className="text-[#2f6a4f] underline-offset-4 hover:underline">
          {t("backToCart")}
        </Link>
        <span className="hidden text-muted-foreground sm:inline" aria-hidden>
          ·
        </span>
        <Link to="/products" className="text-[#2f6a4f] underline-offset-4 hover:underline">
          {t("continueShopping")}
        </Link>
      </div>
    </aside>
  );
}
