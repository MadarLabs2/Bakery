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
    <div className="container mx-auto px-4 py-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {t("products")}
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl bg-secondary">
          {product.image_url && (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          {product.category && (
            <span className="text-sm uppercase tracking-wide text-muted-foreground">
              {pickName(product.category, lang)}
            </span>
          )}
          <h1 className="font-display text-4xl font-bold md:text-5xl">{pickName(product, lang)}</h1>
          {product.is_best_seller && (
            <span className="w-fit rounded-full bg-accent/40 px-3 py-1 text-sm font-medium">
              ★ {t("bestSellers")}
            </span>
          )}
          <p className="text-lg text-muted-foreground">{pickDesc(product, lang)}</p>
          <div className="font-display text-4xl font-bold text-primary">
            ₪{Number(product.price).toFixed(2)}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>
                −
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty(qty + 1)}>
                +
              </button>
            </div>
            <Button size="lg" onClick={handleAdd}>
              <Plus className="h-4 w-4" /> {t("addToCart")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
