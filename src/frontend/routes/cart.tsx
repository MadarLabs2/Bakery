import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { useCart } from "@/frontend/lib/cart";
import { meetsDeliveryMinimum } from "@/frontend/lib/checkoutDelivery";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { resolveImage } from "@/frontend/lib/images";
import { useReleasePendingCardOrder } from "@/frontend/lib/useReleasePendingCardOrder";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { t, lang } = useI18n();
  const { items, subtotal, updateQty, remove, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const { releaseIfNeeded } = useReleasePendingCardOrder();
  const [restoringCart, setRestoringCart] = useState(false);
  const restoreAttemptedRef = useRef(false);

  useEffect(() => {
    if (!user || cartLoading || items.length > 0 || restoreAttemptedRef.current) return;
    restoreAttemptedRef.current = true;
    let cancelled = false;
    void (async () => {
      setRestoringCart(true);
      try {
        const outcome = await releaseIfNeeded();
        if (cancelled) return;
        if (outcome === "already_paid") {
          nav({ to: "/orders" });
        } else if (outcome === "released") {
          toast.info(t("cardCartRestored"));
        }
      } finally {
        if (!cancelled) setRestoringCart(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, cartLoading, items.length, releaseIfNeeded, nav, t]);

  // Only block when actively fetching cart data for a signed-in user — never wait on auth bootstrap.
  const showLoading = (Boolean(user) && cartLoading) || restoringCart;

  if (showLoading) {
    return (
      <div className="admin-page-enter container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="admin-page-enter container mx-auto px-4 py-20 text-center">
        <h1 className="page-title-enter font-display text-3xl font-bold">{t("empty")}</h1>
        <div className="section-card-enter mt-6 inline-block" style={{ animationDelay: "120ms" }}>
          <Button asChild>
            <Link to="/products">{t("shopAll")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-enter container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-3">
      <div className="admin-list-stagger lg:col-span-2 space-y-4">
        <h1 className="page-title-enter font-display text-3xl font-bold">{t("cart")}</h1>
        {items.map((i) => (
          <div key={i.id} className="flex gap-4 rounded-2xl border bg-card p-4">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
              {i.product.image_url && (
                <img
                  src={resolveImage(i.product.image_url)!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <h3 className="font-semibold">{pickName(i.product, lang)}</h3>
              <p className="text-sm text-muted-foreground">₪{Number(i.product.price).toFixed(2)}</p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center rounded-md border" role="group" aria-label={t("quantityLabel")}>
                    <button
                      type="button"
                      className="px-3 py-1.5 disabled:opacity-40"
                      onClick={() => updateQty(i.id, i.quantity - 1)}
                      disabled={i.quantity <= 1}
                      aria-label={t("decreaseQuantity")}
                    >
                      <Minus className="h-3 w-3" aria-hidden />
                    </button>
                    <span className="w-10 text-center text-sm" aria-live="polite">
                      {i.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 disabled:opacity-40"
                      onClick={() => updateQty(i.id, i.quantity + 1)}
                      disabled={i.product.stock_quantity != null && i.quantity >= i.product.stock_quantity}
                      aria-label={t("increaseQuantity")}
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                    </button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(i.id)}>
                  <Trash2 className="h-4 w-4" /> {t("remove")}
                </Button>
              </div>
            </div>
            <div className="font-display text-lg font-bold">
              ₪{(i.quantity * Number(i.product.price)).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <aside className="section-card-enter h-fit space-y-4 rounded-2xl border bg-card p-6" style={{ animationDelay: "260ms" }}>
        <h2 className="font-display text-xl font-bold">{t("total")}</h2>
        <div className="flex justify-between text-sm">
          <span>{t("subtotal")}</span>
          <span>₪{subtotal.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4 flex justify-between font-display text-lg font-bold">
          <span>{t("total")}</span>
          <span>₪{subtotal.toFixed(2)}</span>
        </div>
        {!meetsDeliveryMinimum(subtotal) ? (
          <p className="rounded-xl border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-950">
            {t("deliveryMinOrderHint")}
          </p>
        ) : null}
        <Button
          className="w-full"
          size="lg"
          onClick={() => nav({ to: user ? "/checkout" : "/login" })}
        >
          {t("checkout")}
        </Button>
      </aside>
    </div>
  );
}
