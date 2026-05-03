import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wheat, Heart, Award, Truck } from "lucide-react";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { ProductCard } from "@/frontend/components/ProductCard";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";
import { ScrollReveal3D } from "@/frontend/components/ScrollReveal3D";
import { HeroImageShowcase } from "@/frontend/components/HeroImageShowcase";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Al-Nour Gluten-Free Bakery — Fresh, wholesome, baked with love" },
      {
        name: "description",
        content:
          "Artisan gluten-free breads, pastries, cakes and cookies. Order online for pickup or delivery.",
      },
    ],
  }),
});

function HomePage() {
  const { t, lang } = useI18n();
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subbing, setSubbing] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .eq("is_available", true)
            .eq("is_best_seller", true)
            .limit(4),
          supabase.from("categories").select("*").order("name"),
        ]);

        if (cancelled) return;

        if (prodRes.error) {
          console.error("Best sellers:", prodRes.error);
        }
        if (catRes.error) {
          console.error("Categories:", catRes.error);
        }

        setBestSellers(prodRes.data ?? []);
        setCategories(catRes.data ?? []);

        const msg = catRes.error?.message ?? prodRes.error?.message;
        if (msg) {
          toast.error(`${msg} — ${t("catalogConfigHint")}`, { duration: 8000 });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error(t("catalogConnectionError"));
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubbing(true);
    const { error } = await supabase.from("email_subscribers").insert({ email });
    setSubbing(false);
    if (error) {
      if (error.code === "23505") toast.info(t("alreadySub"));
      else toast.error(error.message);
    } else {
      toast.success(t("thanks"));
      setEmail("");
    }
  };

  return (
    <div>
      {/* HERO — semicircle dome only (images inside curve); no flat green bar underneath */}
      <section className="relative isolate overflow-hidden bg-primary pb-[max(0rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+0.875rem)] md:pt-[calc(env(safe-area-inset-top)+1rem)]">
        <h1 className="sr-only">{t("brand")}</h1>
        <HeroImageShowcase activeIndex={heroSlide} onActiveIndexChange={setHeroSlide} />
      </section>

      {/* FEATURES */}
      <section className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-3">
        {[
          {
            icon: Heart,
            title: { en: "Made with love", he: "נעשה באהבה", ar: "مصنوع بحب" },
            desc: {
              en: "Family recipes, perfected.",
              he: "מתכוני המשפחה, מושלמים.",
              ar: "وصفات عائلية مُتقنة.",
            },
          },
          {
            icon: Award,
            title: { en: "Premium ingredients", he: "חומרי גלם מובחרים", ar: "مكونات فاخرة" },
            desc: {
              en: "Only the finest, naturally.",
              he: "רק הטובים ביותר, באופן טבעי.",
              ar: "أجود المكونات الطبيعية.",
            },
          },
          {
            icon: Truck,
            title: { en: "Pickup or delivery", he: "איסוף או משלוח", ar: "استلام أو توصيل" },
            desc: { en: "We bring it to you.", he: "אנחנו מביאים אליכם.", ar: "نوصلها إليك." },
          },
        ].map((f, i) => (
          <ScrollReveal3D
            key={i}
            variant={i % 2 === 0 ? "tilt-left" : "tilt-right"}
            delayMs={i * 90}
          >
            <div className="home-feature-card group h-full cursor-default touch-manipulation rounded-2xl border border-border/80 bg-card p-6 text-center">
              <f.icon className="mx-auto h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110 group-active:scale-95 motion-reduce:group-hover:scale-100" />
              <h3 className="mt-3 font-display text-lg font-semibold">{f.title[lang]}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc[lang]}</p>
            </div>
          </ScrollReveal3D>
        ))}
      </section>

      {/* CATEGORIES — 2 per row on phones; placeholders while loading so section never collapses */}
      <section className="container mx-auto px-4 py-12">
        <ScrollReveal3D variant="tilt-up" className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t("categories")}</h2>
            <Link to="/categories" className="shrink-0 text-sm text-primary hover:underline">
              {t("shopAll")} →
            </Link>
          </div>
        </ScrollReveal3D>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categoriesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))
          ) : categories.length === 0 ? (
            <p className="col-span-2 text-center text-muted-foreground md:col-span-4">
              {t("noCategories")}
            </p>
          ) : (
            categories.map((c, i) => {
              const imgSrc = c.image_url ? resolveImage(c.image_url) : null;
              return (
                <ScrollReveal3D
                  key={c.id}
                  variant={i % 2 === 0 ? "zoom" : "tilt-up"}
                  delayMs={(i % 4) * 75}
                >
                  <Link
                    to="/products"
                    search={{ category: c.id } as any}
                    className="group relative block aspect-[4/5] min-h-[140px] overflow-hidden rounded-2xl ring-1 ring-border/60"
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
                        <Wheat className="h-12 w-12 text-primary/40 sm:h-14 sm:w-14" />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 right-3 font-display text-base font-bold leading-tight text-white drop-shadow-sm sm:bottom-4 sm:left-4 sm:right-4 sm:text-xl">
                      {pickName(c, lang)}
                    </h3>
                  </Link>
                </ScrollReveal3D>
              );
            })
          )}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container mx-auto px-4 py-12">
        <ScrollReveal3D variant="tilt-up" className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-3xl font-bold md:text-4xl">★ {t("bestSellers")}</h2>
            <Link to="/products" className="shrink-0 text-sm text-primary hover:underline">
              {t("shopAll")} →
            </Link>
          </div>
        </ScrollReveal3D>
        <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-4">
          {bestSellers.length === 0 ? (
            <p className="col-span-2 text-center text-sm text-muted-foreground md:col-span-4">
              No best sellers yet — add products marked “best seller” and available in Admin, or
              check your Supabase connection.
            </p>
          ) : (
            bestSellers.map((p, i) => (
              <ScrollReveal3D
                key={p.id}
                className="h-full min-h-0 w-full"
                variant="tilt-up"
                delayMs={(i % 4) * 80}
              >
                <div className="flex min-h-0 h-full min-w-0 w-full flex-col">
                  <ProductCard product={p} compact className="min-h-0 flex-1" />
                </div>
              </ScrollReveal3D>
            ))
          )}
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="container mx-auto px-4 py-12">
        <ScrollReveal3D variant="zoom">
          <div className="rounded-3xl bg-primary/95 px-6 py-12 text-center text-primary-foreground md:px-12 md:py-16">
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t("subscribeTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">{t("subscribeDesc")}</p>
            <form
              onSubmit={subscribe}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                className="flex-1 rounded-md bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground"
              />
              <Button type="submit" variant="secondary" size="lg" disabled={subbing}>
                {t("subscribe")}
              </Button>
            </form>
          </div>
        </ScrollReveal3D>
      </section>
    </div>
  );
}
