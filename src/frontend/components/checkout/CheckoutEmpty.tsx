import { ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/frontend/lib/i18n";
import { Button } from "@/frontend/components/ui/button";

export function CheckoutEmpty() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B4332]/10 text-[#1B4332]">
        <ShoppingBag className="h-8 w-8" aria-hidden />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-[#1B4332]">{t("checkout")}</h1>
      <p className="mt-2 text-muted-foreground">{t("empty")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="h-11">
          <Link to="/products">{t("continueShopping")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 border-[#1B4332]/30">
          <Link to="/cart">{t("backToCart")}</Link>
        </Button>
      </div>
    </div>
  );
}
