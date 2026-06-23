import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/frontend/components/ProductCard";
import { ScrollReveal3D } from "@/frontend/components/ScrollReveal3D";
import { useI18n, pickName } from "@/frontend/lib/i18n";
import { cn } from "@/frontend/lib/utils";

type CategoryProductRailProps = {
  category: {
    id: string;
    name: string;
    name_en?: string | null;
    name_he?: string | null;
    name_ar?: string | null;
  };
  products: Array<{
    id: string;
    name: string;
    description?: string | null;
    description_en?: string | null;
    description_he?: string | null;
    description_ar?: string | null;
    price: number;
    compare_at_price?: number | null;
    image_url: string | null;
    is_best_seller: boolean;
  }>;
};

const CARD_SLOT = cn(
  "shrink-0 grow-0",
  "basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.5rem)]",
  "md:basis-[calc(25%-0.75rem)] lg:basis-[calc(20%-0.8rem)]",
);

function RailChevron({
  pointRight,
  side,
  onClick,
  label,
}: {
  pointRight: boolean;
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const Icon = pointRight ? ChevronRight : ChevronLeft;
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 z-10 w-12 sm:w-14",
          side === "left"
            ? "left-0 bg-gradient-to-r from-background via-background/90 to-transparent"
            : "right-0 bg-gradient-to-l from-background via-background/90 to-transparent",
        )}
        aria-hidden
      />
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn(
          "absolute top-1/2 z-20 flex h-12 w-10 -translate-y-1/2 items-center justify-center",
          "text-neutral-500 transition-colors hover:text-neutral-700",
          side === "left" ? "left-0 pl-0.5" : "right-0 pr-0.5",
        )}
      >
        <Icon
          className="h-7 w-7"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        />
      </button>
    </>
  );
}

export function CategoryProductRail({ category, products }: CategoryProductRailProps) {
  const { t, lang, dir } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRtl = dir === "rtl";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    if (max <= 4) {
      setHasOverflow(false);
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    setHasOverflow(true);

    const rtl = getComputedStyle(el).direction === "rtl";
    const fromStart = rtl
      ? el.scrollLeft <= 0
        ? Math.abs(el.scrollLeft)
        : el.scrollLeft
      : el.scrollLeft;

    setCanScrollPrev(fromStart > 4);
    setCanScrollNext(fromStart < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [products.length, updateScrollState]);

  const scrollByPage = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    const delta =
      direction === "next"
        ? isRtl
          ? -amount
          : amount
        : isRtl
          ? amount
          : -amount;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const atStart = hasOverflow && !canScrollPrev && canScrollNext;
  const atEnd = hasOverflow && canScrollPrev && !canScrollNext;

  /** RTL: start = left →, end = right ←. LTR: mirrored. */
  const startArrowSide: "left" | "right" = isRtl ? "left" : "right";
  const endArrowSide: "left" | "right" = isRtl ? "right" : "left";

  return (
    <section className="container mx-auto px-4 py-10 md:py-12">
      <ScrollReveal3D variant="tilt-up" className="mb-6">
        <h2 className="font-display text-3xl font-bold md:text-4xl">{pickName(category, lang)}</h2>
      </ScrollReveal3D>

      <ScrollReveal3D variant="tilt-up" delayMs={100}>
      <div className="relative w-full">
        {atStart ? (
          <RailChevron
            pointRight={!isRtl}
            side={startArrowSide}
            label={t("carouselNext")}
            onClick={() => scrollByPage("next")}
          />
        ) : null}
        {atEnd ? (
          <RailChevron
            pointRight={isRtl}
            side={endArrowSide}
            label={t("carouselPrev")}
            onClick={() => scrollByPage("prev")}
          />
        ) : null}

        <div
          ref={scrollRef}
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(
            "flex w-full gap-3 overflow-x-auto",
            "touch-pan-x overscroll-x-contain",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {products.map((p, idx) => (
            <div key={p.id} data-rail-card className={CARD_SLOT}>
              <ProductCard product={p} compact minimal rail eager={idx < 4} className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
      </ScrollReveal3D>
    </section>
  );
}
