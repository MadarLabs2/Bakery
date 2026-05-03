import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronUp, Search } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { ProductCard } from "@/frontend/components/ProductCard";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/frontend/lib/utils";
import { hasAnySocialLink } from "@/config/socialLinks";

interface SearchParams {
  category?: string;
}

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Products — Al-Nour Bakery" },
      {
        name: "description",
        content: "Browse our gluten-free breads, pastries, cakes and cookies.",
      },
    ],
  }),
});

function ProductsPage() {
  const { t, lang } = useI18n();
  const { category } = useSearch({ from: "/products/" });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [active, setActive] = useState<string | undefined>(category);
  const [q, setQ] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    setActive(category);
  }, [category]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let query = supabase
      .from("products")
      .select(
        "id, name, description, description_en, description_he, description_ar, price, image_url, is_best_seller, is_available, category_id, category:categories(id, name, name_en, name_he, name_ar)",
      )
      .eq("is_available", true);
    supabase
      .from("categories")
      .select("id")
      .then(({ data: cats }) => {
        if (active && cats) {
          const cat = cats.find((c) => c.id === active);
          if (cat) query = query.eq("category_id", cat.id);
        }
        query.then(({ data }) => setProducts(data ?? []));
      });
  }, [active]);

  const filtered = products.filter((p) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return p.name?.toLowerCase().includes(s);
  });

  const scrollToTop = () => {
    document
      .getElementById("products-page-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 id="products-page-top" className="scroll-mt-28 font-display text-4xl font-bold md:text-5xl">
        {t("products")}
      </h1>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchProducts")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="ps-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!active ? "default" : "outline"}
            size="sm"
            onClick={() => setActive(undefined)}
          >
            {t("productsAllCategoriesFilter")}
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={active === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(c.id)}
            >
              {pickName(c, lang)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="flex min-h-0 h-full min-w-0 w-full flex-col self-stretch">
            <ProductCard product={p} compact className="min-h-0 flex-1" />
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">{t("noProducts")}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className={cn(
          "fixed z-40 size-11 rounded-full border border-border shadow-lg shadow-black/10 transition-[opacity,transform] duration-200 end-5 motion-reduce:transition-none sm:size-12 sm:end-6",
          hasAnySocialLink()
            ? "bottom-[9.75rem] sm:bottom-[10.75rem]"
            : "bottom-6 sm:bottom-8",
          showBackToTop ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-label={t("catalogBackToTop")}
        title={t("catalogBackToTop")}
        onClick={scrollToTop}
      >
        <ChevronUp className="size-5" aria-hidden />
      </Button>
    </div>
  );
}
