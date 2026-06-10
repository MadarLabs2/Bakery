import { Link } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useI18n, pickName, pickDesc, pickIngredients, pickAllergens } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { Button } from "@/frontend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/frontend/components/ui/dialog";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";

const LOGIN_PROMPT: Record<string, { title: string; desc: string }> = {
  en: {
    title: "Login to add items",
    desc: "Create a free account or sign in to start adding products to your cart and place orders.",
  },
  he: {
    title: "יש להתחבר כדי לקנות",
    desc: "צור חשבון חינמי או התחבר כדי להוסיף מוצרים לסל ולבצע הזמנות.",
  },
  ar: {
    title: "سجّل دخولك للتسوق",
    desc: "أنشئ حساباً مجانياً أو سجّل دخولك لإضافة المنتجات إلى السلة وإتمام طلباتك.",
  },
};
import { ProductPriceRow } from "@/frontend/components/ProductPriceRow";

export type ProductDetailModel = {
  id: string;
  name: string;
  description: string | null;
  description_en?: string | null;
  description_he?: string | null;
  description_ar?: string | null;
  ingredients: string | null;
  ingredients_en?: string | null;
  ingredients_he?: string | null;
  ingredients_ar?: string | null;
  allergens: string | null;
  allergens_en?: string | null;
  allergens_he?: string | null;
  allergens_ar?: string | null;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  is_best_seller: boolean;
  is_available?: boolean | null;
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
    name_en?: string | null;
    name_he?: string | null;
    name_ar?: string | null;
    description?: string | null;
    image_url?: string | null;
  } | null;
};

export function ProductDetailView({
  product,
  loading,
  error,
  topSlot,
}: {
  product: ProductDetailModel | null;
  loading?: boolean;
  error?: string | null;
  topSlot?: ReactNode;
}) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const prompt = LOGIN_PROMPT[lang] ?? LOGIN_PROMPT.en;

  useEffect(() => {
    setQty(1);
  }, [product?.id]);

  const handleAdd = async (p: ProductDetailModel) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (p.is_available === false) {
      toast.warning(t("unavailableProduct"));
      return;
    }
    try {
      await addToCart(p.id, qty);
      toast.success(`${pickName(p, lang)} · ${t("itemAddedToCartSuffix")}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("genericError"));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {topSlot && (
          <div className="pd-content-enter" style={{ animationDelay: "0ms" }}>
            {topSlot}
          </div>
        )}
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card p-10 text-center shadow-sm">
        <p className="text-muted-foreground">{error ?? t("productNotFound")}</p>
      </div>
    );
  }

  const description = pickDesc(product, lang);
  const ingredients = pickIngredients(product, lang);
  const allergens = pickAllergens(product, lang);
  const available = product.is_available !== false;

  const shell = (
    <div
      className="pd-card-enter overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03]"
      style={{ animationDelay: "40ms" }}
    >
      <div className="grid gap-0 md:grid-cols-2 md:items-start">
        <div className="relative aspect-square overflow-hidden bg-secondary max-md:min-h-0 md:flex md:min-h-[280px] md:items-center md:justify-center md:bg-gradient-to-b md:from-secondary md:to-muted/40 md:p-8 lg:min-h-[320px] lg:p-10">
          {product.image_url ? (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              className="pd-image-enter h-full w-full object-cover md:h-auto md:max-h-[min(420px,52vh)] md:w-full md:max-w-lg md:rounded-2xl md:object-contain md:object-center md:shadow-md lg:max-h-[min(460px,50vh)] lg:max-w-xl"
            />
          ) : (
            <div className="pd-image-enter flex h-full min-h-[12rem] items-center justify-center text-muted-foreground md:min-h-[200px]">
              —
            </div>
          )}
        </div>

        <div
          className="pd-content-enter flex flex-col gap-4 border-t border-border/60 bg-gradient-to-b from-card to-muted/10 p-6 md:border-t-0 md:border-s md:p-8 lg:p-10"
          style={{ animationDelay: "80ms" }}
        >
          {product.category ? (
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {pickName(product.category, lang)}
            </span>
          ) : null}
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            {pickName(product, lang)}
          </h1>
          {product.is_best_seller ? (
            <span className="w-fit rounded-full bg-accent/45 px-3 py-1 text-sm font-medium text-accent-foreground">
              ★ {t("bestSellers")}
            </span>
          ) : null}
          {description ? (
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">
              {description}
            </p>
          ) : null}
          {!available ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {t("unavailableProduct")}
            </p>
          ) : null}
          <div>
            <ProductPriceRow price={Number(product.price)} compareAtPrice={product.compare_at_price} variant="hero" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <div
              className="flex items-center overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm"
              aria-label="Quantity"
            >
              <button
                type="button"
                className="pd-qty-btn px-4 py-2.5 text-lg leading-none hover:bg-muted"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="min-w-[2.5rem] text-center text-base font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                className="pd-qty-btn px-4 py-2.5 text-lg leading-none hover:bg-muted"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
            <Button size="lg" className="pd-add-wrap gap-2 rounded-xl shadow-sm" disabled={!available} onClick={() => handleAdd(product)}>
              <Plus className="h-4 w-4 shrink-0" />
              {t("addToCart")}
            </Button>
          </div>
        </div>
      </div>

      {(ingredients || allergens) && (
        <div
          className="pd-section-enter divide-y divide-border/60 border-t border-border/60 bg-muted/15"
          style={{ animationDelay: "160ms" }}
        >
          {ingredients ? (
            <section className="p-6 md:p-8 lg:p-10">
              <h2 className="font-display text-xl font-semibold text-foreground md:text-2xl">{t("ingredients")}</h2>
              <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed text-muted-foreground">
                {ingredients}
              </p>
            </section>
          ) : null}
          {allergens ? (
            <section className="p-6 md:p-8 lg:p-10">
              <h2 className="font-display text-xl font-semibold text-foreground md:text-2xl">{t("allergens")}</h2>
              <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed text-muted-foreground">
                {allergens}
              </p>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {topSlot && (
        <div className="pd-content-enter" style={{ animationDelay: "0ms" }}>
          {topSlot}
        </div>
      )}
      {shell}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-sm rounded-2xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            {prompt.title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {prompt.desc}
          </DialogDescription>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button asChild className="h-11 w-full">
              <Link to="/login">{t("login")}</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full">
              <Link to="/register">{t("register")}</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
