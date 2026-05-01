import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Wheat, Heart, Award, Truck } from "lucide-react";
import heroImg from "@/frontend/assets/hero.jpg";
import heroVideo from "@/images/vecteezy_sun-drenched-slice-of-soft-white-bread-resting-on-a-ceramic_73935100.mp4";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { ProductCard } from "@/frontend/components/ProductCard";
import { resolveImage } from "@/frontend/lib/images";
import { toast } from "sonner";

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
    supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .eq("is_best_seller", true)
      .limit(4)
      .then(({ data }) => setBestSellers(data ?? []));
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => setCategories(data ?? []))
      .finally(() => setCategoriesLoading(false));
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
      {/* HERO — full-bleed background video (src/images/vecteezy_…mp4) + readable text overlay */}
      <section className="relative min-h-[min(92vh,880px)] overflow-hidden">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
          src={heroVideo}
          poster={heroImg}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-black/35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/95 via-background/75 to-background/25 md:from-background/90 md:via-background/45 md:to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-warm-gradient opacity-40 mix-blend-multiply" />
        <div className="container relative z-10 mx-auto flex min-h-[min(92vh,880px)] flex-col justify-center px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <Wheat className="h-4 w-4" /> 100% Gluten-Free
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-balance text-foreground drop-shadow-sm md:text-6xl lg:text-7xl">
              {t("brand")}
            </h1>
            <p className="max-w-md text-lg text-foreground/90 drop-shadow-sm md:text-xl">
              {t("tagline")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/products">
                  {t("shopAll")} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Link to="/about">{t("about1")}</Link>
              </Button>
            </div>
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
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))
            : categories.length === 0 ? (
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
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold md:text-4xl">★ {t("bestSellers")}</h2>
          <Link to="/products" className="text-sm text-primary hover:underline">
            {t("shopAll")} →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
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
