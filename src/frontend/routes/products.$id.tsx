import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useI18n, pickName, pickDesc } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { Button } from "@/frontend/components/ui/button";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    supabase
      .from("products")
      .select(
        "id, name, description, ingredients, allergens, price, image_url, is_best_seller, is_available, category_id, category:categories(id, name, description, image_url)",
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setProduct(data));
  }, [id]);

  if (!product)
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>
    );

  const description = pickDesc(product, lang);
  const ingredients = product.ingredients ? String(product.ingredients).trim() : "";
  const allergens = product.allergens ? String(product.allergens).trim() : "";

  const handleAdd = async () => {
    if (!user) {
      toast.error(t("login"));
      return;
    }
    try {
      await addToCart(product.id, qty);
      toast.success(pickName(product, lang) + " ✓");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {t("products")}
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-2 md:gap-0">
          <div className="aspect-square bg-secondary md:min-h-[min(100vw,520px)]">
            {product.image_url && (
              <img
                src={resolveImage(product.image_url)!}
                alt={pickName(product, lang)}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex flex-col gap-4 border-t p-6 md:border-t-0 md:border-s md:p-8 lg:p-10">
            {product.category && (
              <span className="text-sm uppercase tracking-wide text-muted-foreground">
                {pickName(product.category, lang)}
              </span>
            )}
            <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {pickName(product, lang)}
            </h1>
            {product.is_best_seller && (
              <span className="w-fit rounded-full bg-accent/40 px-3 py-1 text-sm font-medium">
                ★ {t("bestSellers")}
              </span>
            )}
            <div className="font-display text-3xl font-bold text-primary md:text-4xl">
              ₪{Number(product.price).toFixed(2)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-md border">
                <button
                  type="button"
                  className="px-3 py-2"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  −
                </button>
                <span className="w-10 text-center">{qty}</span>
                <button type="button" className="px-3 py-2" onClick={() => setQty(qty + 1)}>
                  +
                </button>
              </div>
              <Button size="lg" onClick={handleAdd}>
                <Plus className="h-4 w-4" /> {t("addToCart")}
              </Button>
            </div>
          </div>
        </div>

        {(description || ingredients || allergens) && (
          <div className="space-y-0 border-t bg-muted/20">
            {description ? (
              <section className="p-6 md:p-8 lg:p-10">
                <h2 className="font-display text-xl font-semibold text-foreground md:text-2xl">
                  {t("aboutProduct")}
                </h2>
                <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed text-muted-foreground md:text-lg">
                  {description}
                </p>
              </section>
            ) : null}
            {ingredients ? (
              <section
                className={`p-6 md:p-8 lg:p-10 ${description ? "border-t border-border/60" : ""}`}
              >
                <h2 className="font-display text-xl font-semibold text-foreground md:text-2xl">
                  {t("ingredients")}
                </h2>
                <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed text-muted-foreground">
                  {ingredients}
                </p>
              </section>
            ) : null}
            {allergens ? (
              <section
                className={`p-6 md:p-8 lg:p-10 ${description || ingredients ? "border-t border-border/60" : ""}`}
              >
                <h2 className="font-display text-xl font-semibold text-foreground md:text-2xl">
                  {t("allergens")}
                </h2>
                <p className="mt-3 max-w-3xl whitespace-pre-wrap break-words text-base leading-relaxed text-muted-foreground">
                  {allergens}
                </p>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
