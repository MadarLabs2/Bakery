import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickName } from "@/lib/i18n";
import { resolveImage } from "@/lib/images";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({ meta: [{ title: "Categories — Al-Nour Bakery" }] }),
});

function CategoriesPage() {
  const { t, lang } = useI18n();
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => { supabase.from("categories").select("*").order("display_order").then(({ data }) => setCats(data ?? [])); }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold md:text-5xl">{t("categories")}</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {cats.map(c => (
          <Link key={c.id} to="/products" search={{ category: c.slug } as any}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
            {c.image_url && <img src={resolveImage(c.image_url)!} alt={pickName(c, lang)} loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <h3 className="absolute bottom-4 left-4 right-4 font-display text-2xl font-bold text-white">{pickName(c, lang)}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
