import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickName } from "@/lib/i18n";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Search { category?: string }

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): Search => ({ category: typeof s.category === "string" ? s.category : undefined }),
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Products — Al-Nour Bakery" }, { name: "description", content: "Browse our gluten-free breads, pastries, cakes and cookies." }] }),
});

function ProductsPage() {
  const { t, lang } = useI18n();
  const { category } = useSearch({ from: "/products" });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [active, setActive] = useState<string | undefined>(category);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("categories").select("*").order("display_order").then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => { setActive(category); }, [category]);

  useEffect(() => {
    let query = supabase.from("products").select("*, category:categories(slug, name_en, name_he, name_ar)").eq("is_active", true);
    supabase.from("categories").select("id, slug").then(({ data: cats }) => {
      if (active && cats) {
        const cat = cats.find(c => c.slug === active);
        if (cat) query = query.eq("category_id", cat.id);
      }
      query.then(({ data }) => setProducts(data ?? []));
    });
  }, [active]);

  const filtered = products.filter(p => {
    if (!q) return true;
    const s = q.toLowerCase();
    return [p.name_en, p.name_he, p.name_ar].some(n => n?.toLowerCase().includes(s));
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold md:text-5xl">{t("products")}</h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("searchProducts")} value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={!active ? "default" : "outline"} size="sm" onClick={() => setActive(undefined)}>All</Button>
          {categories.map(c => (
            <Button key={c.id} variant={active === c.slug ? "default" : "outline"} size="sm" onClick={() => setActive(c.slug)}>
              {pickName(c, lang)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && <p className="mt-12 text-center text-muted-foreground">{t("noProducts")}</p>}
    </div>
  );
}
