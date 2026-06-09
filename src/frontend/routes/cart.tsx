import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Minus, Plus } from "lucide-react";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { useCart } from "@/frontend/lib/cart";
import { useAuth } from "@/frontend/lib/auth";
import { Button } from "@/frontend/components/ui/button";
import { resolveImage } from "@/frontend/lib/images";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const { t, lang } = useI18n();
  const { items, subtotal, updateQty, remove } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

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
                <div className="flex items-center rounded-md border">
                  <button className="px-3 py-1.5" onClick={() => updateQty(i.id, i.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-10 text-center text-sm">{i.quantity}</span>
                  <button className="px-3 py-1.5" onClick={() => updateQty(i.id, i.quantity + 1)}>
                    <Plus className="h-3 w-3" />
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
