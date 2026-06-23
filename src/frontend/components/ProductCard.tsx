import { Link, useRouter } from "@tanstack/react-router";
import { Plus, ShoppingBag } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useI18n, pickName, pickDesc } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { Button } from "@/frontend/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/frontend/components/ui/dialog";
import { resolveImage } from "@/frontend/lib/images";
import { cn } from "@/frontend/lib/utils";
import { toast } from "sonner";
import { ProductPriceRow } from "@/frontend/components/ProductPriceRow";

interface Product {
  id: string;
  name: string;
  description: string | null;
  description_en?: string | null;
  description_he?: string | null;
  description_ar?: string | null;
  price: number;
  compare_at_price?: number | null;
  image_url: string | null;
  is_best_seller: boolean;
  stock_quantity?: number | null;
}

const LOGIN_PROMPT: Record<string, { title: string; desc: string }> = {
  en: {
    title: "Login to add items",
    desc: "Create a free account or sign in to start adding products to your cart and place orders.",
  },
  he: {
    title: "יש להתחבר כדי לקנות",
    desc: "צור חשבון חינמי או התחבר כדי להוסיף מוצרים לסל ולבצע הזמנות.",
  },
  ar: {
    title: "سجّل دخولك للتسوق",
    desc: "أنشئ حساباً مجانياً أو سجّل دخولك لإضافة المنتجات إلى السلة وإتمام طلباتك.",
  },
};

/** Fixed 2-line block for compact cards — tight, fully clipped inside the card. */
const COMPACT_DESC_LINES =
  "min-h-[2.3125rem] max-h-[2.3125rem] sm:min-h-[2.5rem] sm:max-h-[2.5rem] md:min-h-[2.625rem] md:max-h-[2.625rem]";

/** True if full text exceeds `maxLines` at this width (clone). */
function isTextTruncatedInClamp(el: HTMLElement, fullText: string, maxLines: number): boolean {
  if (!fullText.trim()) return false;
  const width = el.getBoundingClientRect().width;
  if (width < 8) return false;

  const cs = window.getComputedStyle(el);
  const clone = document.createElement("p");
  clone.textContent = fullText;
  clone.setAttribute("aria-hidden", "true");
  clone.style.cssText = [
    "position:absolute",
    "left:-99999px",
    "top:0",
    `width:${Math.ceil(width)}px`,
    `font-family:${cs.fontFamily}`,
    `font-size:${cs.fontSize}`,
    `font-weight:${cs.fontWeight}`,
    `line-height:${cs.lineHeight}`,
    `letter-spacing:${cs.letterSpacing}`,
    "white-space:normal",
    "overflow-wrap:anywhere",
    "word-break:break-word",
    "overflow:visible",
    "visibility:hidden",
    "pointer-events:none",
    "margin:0",
  ].join(";");

  document.body.appendChild(clone);
  const naturalHeight = clone.offsetHeight;
  document.body.removeChild(clone);

  const lhRaw = parseFloat(cs.lineHeight);
  const fontSize = parseFloat(cs.fontSize) || 14;
  const lineHeightPx =
    Number.isFinite(lhRaw) && lhRaw > 0 ? lhRaw : Number.isFinite(fontSize) ? fontSize * 1.375 : 18;
  const lineCap = lineHeightPx * maxLines + 1;

  return naturalHeight > lineCap;
}

/** “Read more” only when description needs more than ~3 lines at this card width. */
function CompactProductDescription({
  desc,
  productId,
  onOpenDetail,
}: {
  desc: string;
  productId: string;
  onOpenDetail?: (id: string) => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = pRef.current;
    if (!el || !desc) {
      setIsTruncated(false);
      return;
    }
    let cancelled = false;
    const run = () => {
      const node = pRef.current;
      if (!cancelled && node) setIsTruncated(isTextTruncatedInClamp(node, desc, 2));
    };
    run();
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) run();
      });
    });
    const ro = new ResizeObserver(() => {
      if (!cancelled) run();
    });
    ro.observe(el);
    window.addEventListener("resize", run);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [desc, productId]);

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex w-full shrink-0 flex-col gap-0">
        <p
          ref={pRef}
          dir="auto"
          className={cn(
            COMPACT_DESC_LINES,
            "box-border w-full overflow-hidden text-ellipsis text-muted-foreground [overflow-wrap:anywhere] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
            "hyphens-auto break-words text-[11px] leading-snug sm:text-xs md:text-sm",
          )}
        >
          {desc}
        </p>
        <div className="flex min-h-[1.375rem] shrink-0 items-start">
          {isTruncated ? (
            <button
              type="button"
              className="touch-manipulation py-0 text-start text-[11px] font-medium text-primary underline-offset-2 hover:underline sm:text-xs"
              onClick={() => {
                if (onOpenDetail) onOpenDetail(productId);
                else void router.navigate({ to: "/products/$id", params: { id: productId } });
              }}
            >
              {t("readMore")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({
  product,
  compact,
  minimal,
  rail,
  eager,
  onProductNavigate,
  className,
}: {
  product: Product;
  compact?: boolean;
  /** Image, name, price, add-to-cart only — no description (homepage rails). */
  minimal?: boolean;
  /** Tighter layout for homepage category rails only. */
  rail?: boolean;
  /** Load image immediately instead of lazy (for above-the-fold cards). */
  eager?: boolean;
  /** When set, image/title open detail via callback (e.g. modal) instead of navigating away */
  onProductNavigate?: (id: string) => void;
  className?: string;
}) {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const desc = pickDesc(product, lang);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const prompt = LOGIN_PROMPT[lang] ?? LOGIN_PROMPT.en;

  const outOfStock = product.stock_quantity != null && product.stock_quantity <= 0;

  const handleAdd = async () => {
    if (outOfStock) {
      toast.warning(t("outOfStock"));
      return;
    }
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await addToCart(product.id);
      toast.success(`${pickName(product, lang)} · ${t("itemAddedToCartSuffix")}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("genericError"));
    }
  };

  const isRail = !!(rail && compact && minimal);

  const bestSellerBadge =
    product.is_best_seller ? (
      <span
        className={cn(
          "pointer-events-none absolute top-2 right-2 z-10 inline-flex max-w-[calc(100%-1rem)] items-center rounded-full bg-accent/90 font-medium leading-none text-accent-foreground shadow-md ring-1 ring-black/5 backdrop-blur-[2px]",
          compact ? "px-1.5 py-1 text-[10px] sm:px-2 sm:py-1.5 sm:text-xs" : "px-2 py-1.5 text-xs",
          isRail && "top-1.5 right-1.5 px-1 py-0.5 text-[9px] sm:text-[10px]",
        )}
      >
        ★ {t("bestSellers")}
      </span>
    ) : null;

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg",
        compact && "h-full min-h-0 w-full rounded-xl shadow-sm",
        isRail && "rounded-lg [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md",
        className,
      )}
    >
      {onProductNavigate ? (
        <button
          type="button"
          className={cn(
            "relative block w-full shrink-0 overflow-hidden bg-secondary text-start",
            isRail ? "aspect-[5/4]" : "aspect-square",
          )}
          onClick={() => onProductNavigate(product.id)}
        >
          {bestSellerBadge}
          {product.image_url ? (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              loading={eager ? "eager" : "lazy"}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                outOfStock && "opacity-50 grayscale",
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center bg-black/60 py-2 text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
              {t("outOfStock")}
            </span>
          )}
        </button>
      ) : (
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className={cn(
            "relative block shrink-0 overflow-hidden bg-secondary",
            isRail ? "aspect-[5/4]" : "aspect-square",
          )}
        >
          {bestSellerBadge}
          {product.image_url ? (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              loading={eager ? "eager" : "lazy"}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                outOfStock && "opacity-50 grayscale",
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center bg-black/60 py-2 text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
              {t("outOfStock")}
            </span>
          )}
        </Link>
      )}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          isRail
            ? "gap-0 p-1.5 sm:p-2"
            : compact
              ? "gap-1 p-2 sm:p-2.5 md:gap-1 md:p-3"
              : "flex-1 flex-col gap-2 p-4",
        )}
      >
        {onProductNavigate ? (
          <button
            type="button"
            className="min-w-0 shrink-0 text-start"
            onClick={() => onProductNavigate(product.id)}
          >
            <h3
              className={cn(
                "font-display font-semibold leading-tight",
                isRail
                  ? "line-clamp-2 text-xs leading-snug sm:text-sm"
                  : compact
                    ? "line-clamp-2 min-h-[2.25rem] text-sm sm:min-h-[2.375rem] sm:text-base md:text-lg"
                    : "text-lg",
              )}
            >
              {pickName(product, lang)}
            </h3>
          </button>
        ) : (
          <Link to="/products/$id" params={{ id: product.id }} className="min-w-0 shrink-0">
            <h3
              className={cn(
                "font-display font-semibold leading-tight",
                isRail
                  ? "line-clamp-2 text-xs leading-snug sm:text-sm"
                  : compact
                    ? "line-clamp-2 min-h-[2.25rem] text-sm sm:min-h-[2.375rem] sm:text-base md:text-lg"
                    : "text-lg",
              )}
            >
              {pickName(product, lang)}
            </h3>
          </Link>
        )}

        {compact && !minimal ? (
          desc ? (
            <CompactProductDescription
              desc={desc}
              productId={product.id}
              onOpenDetail={onProductNavigate}
            />
          ) : (
            <div className="min-w-0 flex w-full shrink-0 flex-col" aria-hidden>
              <div className={COMPACT_DESC_LINES} />
              <div className="min-h-[1.375rem]" />
            </div>
          )
        ) : compact && minimal ? null : (
          <p dir="auto" className="line-clamp-2 min-h-[2.75rem] text-sm text-muted-foreground">
            {desc}
          </p>
        )}

        {!isRail ? <div className="min-h-0 flex-1" aria-hidden /> : null}

        <div
          className={cn(
            "flex shrink-0 gap-2",
            isRail
              ? "mt-0.5 flex-row items-center justify-between gap-1.5 pt-0"
              : compact
                ? "flex-col items-stretch pt-0.5 md:flex-row md:items-center md:justify-between md:pt-1"
                : "items-center justify-between pt-2",
          )}
        >
          <ProductPriceRow
            price={Number(product.price)}
            compareAtPrice={product.compare_at_price}
            variant={isRail ? "rail" : compact ? "compact" : "default"}
            className={cn(compact || isRail ? "min-w-0" : undefined)}
          />
          <Button
            size="sm"
            className={cn(
              "inline-flex shrink-0 items-center gap-1",
              isRail && "h-7 px-2 text-[10px] sm:h-7 sm:text-[11px]",
              compact && !isRail && "h-8 w-full text-xs md:w-auto",
            )}
            onClick={handleAdd}
            disabled={outOfStock}
          >
            <Plus className={cn("shrink-0", isRail ? "h-3 w-3" : "h-4 w-4")} />
            {outOfStock ? t("outOfStock") : t("addToCart")}
          </Button>
        </div>
      </div>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-sm rounded-2xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            {prompt.title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {prompt.desc}
          </DialogDescription>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button asChild className="h-11 w-full">
              <Link to="/login">{t("login")}</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full">
              <Link to="/register">{t("register")}</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
