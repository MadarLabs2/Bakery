import { Link, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useI18n, pickName, pickDesc } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { Button } from "@/frontend/components/ui/button";
import { resolveImage } from "@/frontend/lib/images";
import { cn } from "@/frontend/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  description_en?: string | null;
  description_he?: string | null;
  description_ar?: string | null;
  price: number;
  image_url: string | null;
  is_best_seller: boolean;
}

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
  onProductNavigate,
  className,
}: {
  product: Product;
  compact?: boolean;
  /** When set, image/title open detail via callback (e.g. modal) instead of navigating away */
  onProductNavigate?: (id: string) => void;
  className?: string;
}) {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const desc = pickDesc(product, lang);

  const handleAdd = async () => {
    if (!user) {
      toast.error(t("login"));
      return;
    }
    try {
      await addToCart(product.id);
      toast.success(`${pickName(product, lang)} · ${t("itemAddedToCartSuffix")}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("genericError"));
    }
  };

  const bestSellerBadge =
    product.is_best_seller ? (
      <span
        className={cn(
          "pointer-events-none absolute top-2 right-2 z-10 inline-flex max-w-[calc(100%-1rem)] items-center rounded-full bg-accent/90 font-medium leading-none text-accent-foreground shadow-md ring-1 ring-black/5 backdrop-blur-[2px]",
          compact ? "px-1.5 py-1 text-[10px] sm:px-2 sm:py-1.5 sm:text-xs" : "px-2 py-1.5 text-xs",
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
        className,
      )}
    >
      {onProductNavigate ? (
        <button
          type="button"
          className="relative block aspect-square w-full shrink-0 overflow-hidden bg-secondary text-start"
          onClick={() => onProductNavigate(product.id)}
        >
          {bestSellerBadge}
          {product.image_url ? (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </button>
      ) : (
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="relative block aspect-square shrink-0 overflow-hidden bg-secondary"
        >
          {bestSellerBadge}
          {product.image_url ? (
            <img
              src={resolveImage(product.image_url)!}
              alt={pickName(product, lang)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </Link>
      )}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          compact
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
                compact
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
                compact
                  ? "line-clamp-2 min-h-[2.25rem] text-sm sm:min-h-[2.375rem] sm:text-base md:text-lg"
                  : "text-lg",
              )}
            >
              {pickName(product, lang)}
            </h3>
          </Link>
        )}

        {compact ? (
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
        ) : (
          <p dir="auto" className="line-clamp-2 min-h-[2.75rem] text-sm text-muted-foreground">
            {desc}
          </p>
        )}

        <div className="min-h-0 flex-1" aria-hidden />

        <div
          className={cn(
            "flex shrink-0 gap-2",
            compact
              ? "flex-col items-stretch pt-0.5 md:flex-row md:items-center md:justify-between md:pt-1"
              : "items-center justify-between pt-2",
          )}
        >
          <span
            className={cn(
              "font-display font-bold text-primary",
              compact ? "text-sm sm:text-base md:text-xl" : "text-xl",
            )}
          >
            ₪{Number(product.price).toFixed(2)}
          </span>
          <Button
            size="sm"
            className={cn(
              "inline-flex shrink-0 items-center gap-1",
              compact && "h-8 w-full text-xs md:w-auto",
            )}
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {t("addToCart")}
          </Button>
        </div>
      </div>
    </div>
  );
}
