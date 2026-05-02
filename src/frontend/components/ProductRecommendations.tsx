import { useEffect, useState } from "react";
import { supabase } from "@/backend/db/client";
import { useI18n } from "@/frontend/lib/i18n";
import { ProductCard } from "@/frontend/components/ProductCard";
import { Skeleton } from "@/frontend/components/ui/skeleton";

type Row = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_best_seller: boolean;
  is_available: boolean;
  category_id: string | null;
};

const SELECT =
  "id, name, description, price, image_url, is_best_seller, is_available, category_id" as const;

function pickRelated(rows: Row[], categoryId: string | null | undefined, limit: number): Row[] {
  if (!categoryId) return rows.slice(0, limit);
  const same = rows.filter((r) => r.category_id === categoryId);
  const other = rows.filter((r) => r.category_id !== categoryId);
  return [...same, ...other].slice(0, limit);
}

export function ProductRecommendations({
  productId,
  categoryId,
}: {
  productId: string;
  categoryId?: string | null;
}) {
  const { t } = useI18n();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("products")
      .select(SELECT)
      .eq("is_available", true)
      .neq("id", productId)
      .limit(40)
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as Row[];
        setItems(pickRelated(rows, categoryId ?? null, 8));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, categoryId]);

  if (loading) {
    return (
      <section className="mt-10 border-t border-border/60 pt-10" aria-busy="true">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{t("youMayAlsoLike")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-[72%]" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border/60 pt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{t("youMayAlsoLike")}</h2>
      <div className="mt-6 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="flex min-h-0 h-full min-w-0 w-full flex-col self-stretch">
            <ProductCard
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                image_url: p.image_url,
                is_best_seller: p.is_best_seller,
              }}
              compact
              className="min-h-0 flex-1"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
