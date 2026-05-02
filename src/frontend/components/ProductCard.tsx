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
  price: number;
  image_url: string | null;
  is_best_seller: boolean;
}

/** True if full text is taller than three lines at this width (clone; works when flex would break line-clamp). */
function isTextTruncatedInClamp(el: HTMLElement, fullText: string): boolean {
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
  const threeLineCap = lineHeightPx * 3 + 1;

  return naturalHeight > threeLineCap;
}

/** “Read more” only when description needs more than ~3 lines at this card width. */
function CompactProductDescription({ desc, productId }: { desc: string; productId: string }) {
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
      if (!cancelled && node) setIsTruncated(isTextTruncatedInClamp(node, desc));
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden">
      <p
        ref={pRef}
        className={cn(
          "min-h-0 w-full max-h-[3lh] overflow-hidden text-ellipsis text-muted-foreground [overflow-wrap:anywhere] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]",
          "break-words text-[11px] leading-snug sm:text-xs md:text-sm",
        )}
      >
        {desc}
      </p>
      {isTruncated ? (
        <button
          type="button"
          className="relative z-20 shrink-0 touch-manipulation py-2 text-start text-xs font-medium text-primary hover:underline"
          onClick={() => {
            void router.navigate({ to: "/products/$id", params: { id: productId } });
          }}
        >
          {t("readMore")}
        </button>
      ) : null}
    </div>
  );
}

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
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
      toast.success(pickName(product, lang) + " ✓");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg",
        compact && "h-full min-h-0 rounded-xl shadow-sm",
      )}
    >
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="block aspect-square shrink-0 overflow-hidden bg-secondary"
      >
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
      <div
        className={cn(
          "flex flex-col",
          compact
            ? "min-h-0 flex-1 gap-1.5 p-2 sm:p-3 md:gap-2 md:p-4"
            : "flex-1 flex-col gap-2 p-4",
        )}
      >
        {product.is_best_seller && (
          <span
            className={cn(
              "inline-block w-fit shrink-0 rounded-full bg-accent/40 font-medium text-accent-foreground",
              compact ? "px-1.5 py-0.5 text-[10px] sm:text-xs" : "px-2 py-0.5 text-xs",
            )}
          >
            ★ {t("bestSellers")}
          </span>
        )}
        <Link to="/products/$id" params={{ id: product.id }} className="shrink-0">
          <h3
            className={cn(
              "font-display font-semibold leading-tight",
              compact ? "text-sm sm:text-base md:text-lg" : "text-lg",
            )}
          >
            {pickName(product, lang)}
          </h3>
        </Link>

        {compact ? (
          desc ? (
            <CompactProductDescription desc={desc} productId={product.id} />
          ) : (
            <span className="min-h-[1rem] flex-1" aria-hidden />
          )
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
        )}

        <div
          className={cn(
            "mt-auto flex gap-2",
            compact
              ? "shrink-0 flex-col items-stretch pt-1 md:flex-row md:items-center md:justify-between md:pt-2"
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
