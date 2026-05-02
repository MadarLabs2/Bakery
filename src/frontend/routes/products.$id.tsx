import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useI18n } from "@/frontend/lib/i18n";
import { ProductDetailView, type ProductDetailModel } from "@/frontend/components/ProductDetailView";
import { ProductRecommendations } from "@/frontend/components/ProductRecommendations";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
  head: () => ({
    meta: [{ title: "Product — Al-Nour Bakery" }],
  }),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [product, setProduct] = useState<ProductDetailModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("products")
      .select(
        "id, name, description, ingredients, allergens, price, image_url, is_best_seller, is_available, category_id, category:categories(id, name, name_en, name_he, name_ar, description, image_url)",
      )
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        setLoading(false);
        if (err) {
          setError(err.message);
          setProduct(null);
          return;
        }
        setProduct(data as ProductDetailModel | null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const categoryId = product?.category_id ?? product?.category?.id ?? null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
      <ProductDetailView
        product={product}
        loading={loading}
        error={error}
        topSlot={
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("products")}
          </Link>
        }
      />
      {!loading && !error && product ? (
        <ProductRecommendations productId={product.id} categoryId={categoryId} />
      ) : null}
    </div>
  );
}
