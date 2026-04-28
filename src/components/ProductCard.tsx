import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useI18n, pickName, pickDesc } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/images";
import { toast } from "sonner";

interface Product {
  id: string;
  name_en: string; name_he: string; name_ar: string;
  description_en: string | null; description_he: string | null; description_ar: string | null;
  price: number;
  image_url: string | null;
  is_best_seller: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAdd = async () => {
    if (!user) { toast.error(t("login")); return; }
    try { await addToCart(product.id); toast.success(pickName(product, lang) + " ✓"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1">
      <Link to="/products/$id" params={{ id: product.id }} className="block aspect-square overflow-hidden bg-secondary">
        {product.image_url ? (
          <img src={resolveImage(product.image_url)!} alt={pickName(product, lang)} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.is_best_seller && (
          <span className="inline-block w-fit rounded-full bg-accent/40 px-2 py-0.5 text-xs font-medium text-accent-foreground">
            ★ {t("bestSellers")}
          </span>
        )}
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="font-display text-lg font-semibold leading-tight">{pickName(product, lang)}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{pickDesc(product, lang)}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl font-bold text-primary">₪{Number(product.price).toFixed(2)}</span>
          <Button size="sm" onClick={handleAdd}><Plus className="h-4 w-4" /> {t("addToCart")}</Button>
        </div>
      </div>
    </div>
  );
}
