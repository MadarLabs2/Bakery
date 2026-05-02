import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Wheat, Leaf, Heart, Award, Truck } from "lucide-react";
import heroImg from "@/frontend/assets/hero.jpg";
import heroVideo from "@/images/alnoor_bakery_profesional/alnoor_bakery_professional_12s.mp4";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { ProductCard } from "@/frontend/components/ProductCard";
import { resolveImage } from "@/frontend/lib/images";
import { cn } from "@/frontend/lib/utils";
import { toast } from "sonner";

function HeroVideoOverlay({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "w-full max-w-xl rounded-2xl border border-white/15 bg-black/35 px-5 py-8 shadow-none backdrop-blur-md sm:max-w-lg sm:rounded-3xl sm:px-7 sm:py-9 md:max-w-xl md:px-8 md:py-10 lg:max-w-2xl",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/35 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-50 backdrop-blur-sm sm:text-sm">
          <Leaf className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          100% Gluten-Free
        </span>
        <h1 className="font-display text-[1.65rem] font-bold leading-[1.12] text-balance text-[#fefdfb] [text-shadow:0_2px_28px_rgba(0,0,0,0.75)] sm:text-4xl sm:leading-[1.1] md:text-5xl lg:text-6xl">
          {t("brand")}
        </h1>
        <div className="flex items-center gap-3 opacity-95" aria-hidden>
          <div className="h-px min-w-0 flex-1 bg-white/35" />
          <Wheat className="h-5 w-5 shrink-0 text-amber-200/95 sm:h-6 sm:w-6" strokeWidth={1.75} />
          <div className="h-px min-w-0 flex-1 bg-white/35" />
        </div>
        <p className="max-w-lg font-sans text-[0.9375rem] leading-relaxed text-white/92 [text-shadow:0_1px_16px_rgba(0,0,0,0.8)] sm:text-base md:text-lg">
          {t("tagline")}
        </p>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="h-12 w-full rounded-xl font-medium shadow-lg sm:w-auto sm:min-w-[10rem]">
            <Link to="/products" className="gap-2">
              {t("shopAll")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 w-full rounded-xl border-2 border-white/70 bg-white/10 font-medium text-white shadow-lg backdrop-blur-sm hover:bg-white/20 sm:w-auto sm:min-w-[10rem]"
          >
            <Link to="/about">{t("about1")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

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
          toast.error(
            `${msg} — Check Supabase URL/key in your host’s env (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) and redeploy.`,
            { duration: 8000 },
          );
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error(
            "Could not reach the bakery catalog. Check your connection and Supabase settings.",
          );
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

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
      {/* HERO — full-bleed video; copy on video (dark glass, no white box); phone-safe height */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-stone-950 md:min-h-[min(92vh,920px)]">
        <video
          className="pointer-events-none absolute inset-0 h-full min-h-[100svh] w-full scale-[1.06] object-cover object-[center_22%] contrast-[0.98] saturate-[1.05] sm:scale-[1.04] sm:object-[center_28%] md:min-h-full md:object-center"
          src={heroVideo}
          poster={heroImg}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60 sm:via-black/15 md:to-black/50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/15 sm:from-black/55 sm:via-black/22 rtl:bg-gradient-to-l"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_130%_90%_at_20%_55%,rgba(0,0,0,0.5)_0%,transparent_58%)] opacity-95 rtl:opacity-0"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_130%_90%_at_80%_55%,rgba(0,0,0,0.5)_0%,transparent_58%)] opacity-95 rtl:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-4 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))] pt-24 sm:justify-center sm:px-6 sm:pb-20 sm:pt-20 md:min-h-[min(92vh,920px)] md:px-8 md:py-24">
          <div className="pointer-events-none absolute start-2 top-24 opacity-[0.12] sm:start-6 sm:top-28 md:top-1/3 md:opacity-[0.08]" aria-hidden>
            <Wheat className="h-36 w-36 text-amber-100 sm:h-48 sm:w-48" strokeWidth={0.75} />
          </div>
          <div className="relative mx-auto w-full max-w-lg sm:mx-0 sm:max-w-xl md:max-w-xl lg:max-w-2xl">
            <HeroVideoOverlay className="w-full" />
          </div>
        </div>
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
          <div key={i} className="rounded-2xl border bg-card p-6 text-center">
            <f.icon className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold">{f.title[lang]}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc[lang]}</p>
          </div>
        ))}
      </section>

      {/* CATEGORIES — 2 per row on phones; placeholders while loading so section never collapses */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t("categories")}</h2>
          <Link to="/categories" className="shrink-0 text-sm text-primary hover:underline">
            {t("shopAll")} →
          </Link>
        </div>
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
            categories.map((c) => {
              const imgSrc = c.image_url ? resolveImage(c.image_url) : null;
              return (
                <Link
                  key={c.id}
                  to="/products"
                  search={{ category: c.id } as any}
                  className="group relative aspect-[4/5] min-h-[140px] overflow-hidden rounded-2xl ring-1 ring-border/60"
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
              );
            })
          )}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">★ {t("bestSellers")}</h2>
          <Link to="/products" className="shrink-0 text-sm text-primary hover:underline">
            {t("shopAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {bestSellers.length === 0 ? (
            <p className="col-span-2 text-center text-sm text-muted-foreground md:col-span-4">
              No best sellers yet — add products marked “best seller” and available in Admin, or
              check your Supabase connection.
            </p>
          ) : (
            bestSellers.map((p) => (
              <div key={p.id} className="flex h-full min-w-0">
                <ProductCard product={p} compact />
              </div>
            ))
          )}
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="container mx-auto px-4 py-12">
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
      </section>
    </div>
  );
}
