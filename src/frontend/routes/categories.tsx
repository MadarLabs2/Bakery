import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wheat } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { resolveImage } from "@/frontend/lib/images";
import { Skeleton } from "@/frontend/components/ui/skeleton";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categories — Al-Nour Bakery" }] }),
});

function CategoriesPage() {
  const { t, lang } = useI18n();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCats(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold md:text-5xl">{t("categories")}</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))
          : cats.length === 0 ? (
              <p className="col-span-2 text-center text-muted-foreground md:col-span-3">{t("noCategories")}</p>
            ) : (
              cats.map((c) => {
                const imgSrc = c.image_url ? resolveImage(c.image_url) : null;
                return (
                  <Link
                    key={c.id}
                    to="/products"
                    search={{ category: c.id } as any}
                    className="group relative aspect-[4/3] min-h-[120px] overflow-hidden rounded-2xl ring-1 ring-border/60"
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={pickName(c, lang)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-muted to-primary/10">
                        <Wheat className="h-12 w-12 text-primary/40 md:h-14 md:w-14" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 right-3 font-display text-lg font-bold leading-tight text-white drop-shadow-md md:bottom-4 md:left-4 md:right-4 md:text-2xl">
                      {pickName(c, lang)}
                    </h3>
                  </Link>
                );
              })
            )}
      </div>
    </div>
  );
}
