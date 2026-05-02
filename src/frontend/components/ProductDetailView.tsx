import { Plus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useI18n, pickName, pickDesc } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";

export type ProductDetailModel = {
  id: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  price: number;
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

  useEffect(() => {
    setQty(1);
  }, [product?.id]);

  const handleAdd = async (p: ProductDetailModel) => {
    if (!user) {
      toast.error(t("login"));
      return;
    }
    if (p.is_available === false) {
      toast.error(t("unavailableProduct"));
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
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-2 md:items-start">
          <div className="flex aspect-square items-center justify-center bg-secondary p-4 md:aspect-auto md:min-h-[280px] md:p-8">
            <Skeleton className="h-full w-full rounded-none md:max-h-[400px] md:max-w-full md:rounded-2xl" />
          </div>
          <div className="flex flex-col gap-4 border-t p-6 md:border-t-0 md:border-s md:p-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-16 w-full max-w-lg" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
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
  const ingredients = product.ingredients ? String(product.ingredients).trim() : "";
  const allergens = product.allergens ? String(product.allergens).trim() : "";
  const available = product.is_available !== false;

  const shell = (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.03]">
      <div className="grid gap-0 md:grid-cols-2 md:items-start">
        {/* Mobile: full-width square cover (unchanged feel). Desktop: framed, contained photo — no tall half-screen crop. */}
        <div className="relative aspect-square bg-secondary max-md:min-h-0 md:flex md:min-h-[280px] md:items-center md:justify-center md:overflow-hidden md:bg-gradient-to-b md:from-secondary md:to-muted/40 md:p-8 lg:min-h-[320px] lg:p-10">
          {product.image_url ? (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              className="h-full w-full object-cover md:h-auto md:max-h-[min(420px,52vh)] md:w-full md:max-w-lg md:rounded-2xl md:object-contain md:object-center md:shadow-md lg:max-h-[min(460px,50vh)] lg:max-w-xl"
            />
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center text-muted-foreground md:min-h-[200px]">
              —
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-border/60 bg-gradient-to-b from-card to-muted/10 p-6 md:border-t-0 md:border-s md:p-8 lg:p-10">
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
          <div className="font-display text-3xl font-bold text-primary md:text-4xl">
            ₪{Number(product.price).toFixed(2)}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <div
              className="flex items-center overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm"
              aria-label="Quantity"
            >
              <button
                type="button"
                className="px-4 py-2.5 text-lg leading-none transition-colors hover:bg-muted"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="min-w-[2.5rem] text-center text-base font-semibold tabular-nums">{qty}</span>
              <button
                type="button"
                className="px-4 py-2.5 text-lg leading-none transition-colors hover:bg-muted"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
            <Button size="lg" className="gap-2 rounded-xl shadow-sm" disabled={!available} onClick={() => handleAdd(product)}>
              <Plus className="h-4 w-4 shrink-0" />
              {t("addToCart")}
            </Button>
          </div>
        </div>
      </div>

      {(ingredients || allergens) && (
        <div className="divide-y divide-border/60 border-t border-border/60 bg-muted/15">
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
      {topSlot}
      {shell}
    </div>
  );
}
