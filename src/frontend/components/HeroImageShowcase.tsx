import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";

import heroBakeryLogo from "@/images/alnoor_bakery_profesional/BakeryLogo.png";
import heroImg1 from "@/images/ChatGPT Image May 3, 2026, 06_00_08 PM.png";
import heroImg2 from "@/images/C63D6C00-533B-4C81-A2E0-1E1E0962BA54_1_201_a.jpeg";
import heroImg3 from "@/images/ChatGPT Image May 3, 2026, 06_15_44 PM.png";

const SLIDES = [
  { src: heroImg1, alt: "" },
  { src: heroImg2, alt: "" },
  { src: heroImg3, alt: "" },
] as const;

/** Cream tile: emblem + compact CTAs (same widths as the former square tile). */
function HeroDomeLogoBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex w-full shrink-0 justify-center px-1", className)}>
      <div className="pointer-events-auto flex w-[min(92vw,14.375rem)] shrink-0 flex-col items-stretch gap-1 rounded-2xl border border-primary/18 bg-warm-gradient px-2 pb-2 pt-1.5 shadow-[0_22px_60px_-24px_rgba(0,0,0,0.62)] ring-2 ring-white/90 backdrop-blur-[3px] sm:w-[min(87vw,16.75rem)] sm:rounded-3xl sm:gap-1 sm:px-2.5 sm:pb-2 sm:pt-2 md:w-[min(77.5vw,19.5rem)] md:gap-1.5 md:px-3 md:pb-2.5 md:pt-2 lg:w-[min(69vw,21.875rem)] lg:px-3 lg:pb-2.5 lg:pt-2">
        {/* Logo height hugs the graphic (no forced square → no dead band above CTAs); nudged slightly down */}
        <div className="-mb-0.5 flex w-full shrink-0 justify-center overflow-visible px-0.5 pb-0 sm:px-1">
          <img
            src={heroBakeryLogo}
            alt=""
            width={512}
            height={512}
            draggable={false}
            className="mx-auto h-auto w-full max-w-full max-h-[11.75rem] translate-y-[0.25rem] scale-[1.32] object-contain sm:max-h-[13.25rem] sm:translate-y-1 sm:scale-[1.28] md:max-h-[14rem] md:translate-y-1 md:scale-[1.24] lg:max-h-[15rem] lg:translate-y-1.5 lg:scale-[1.2]"
          />
        </div>
        <nav className="flex w-full min-w-0 flex-col gap-2 pt-0.5" aria-label={t("menu")}>
          <Link
            to="/products"
            className="inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/92 sm:min-h-[3rem] sm:px-5 sm:py-3 sm:text-[0.9375rem] md:text-base"
          >
            <span className="truncate">{t("shopAll")}</span>
            <ArrowRight className="size-4 shrink-0 rtl:rotate-180 sm:size-[1.125rem]" aria-hidden />
          </Link>
          <Link
            to="/about"
            className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border-2 border-primary bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/12 sm:min-h-[3rem] sm:px-5 sm:py-3 sm:text-[0.9375rem] md:text-base"
          >
            <span className="line-clamp-2 leading-snug">{t("about1")}</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

/** objectBoundingBox (0–1) for `<clipPath>`. */
const HERO_DOME_PATH_BB = "M 0 1 C 0 0.5 0.25 0 0.5 0 C 0.75 0 1 0.5 1 1 Z";
/** Same shape in viewBox `0 0 100 100`; stroke widths here are proportional (not px). Never use px-wide strokes inside viewBox `0…1` or they blanket the dome. */
const HERO_DOME_PATH_VIEWBOX = "M 0 100 C 0 50 25 0 50 0 C 75 0 100 50 100 100 Z";

/** Peaked bottom strip; tall center aligns with badge; thin edges preserve green botanicals at dome corners. */
function HeroBottomCreamBar() {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-[18] border-t border-white/50 bg-warm-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        "h-[clamp(8.25rem,calc(min(96vw,14.5rem)/4*2.85),13.25rem)] sm:h-[clamp(8.875rem,calc(min(90vw,17rem)/4*2.7),13.75rem)] md:h-[clamp(6.75rem,calc(min(82vw,19.75rem)/4*2.05),10.75rem)] lg:h-[clamp(7.125rem,calc(min(72vw,22.5rem)/4*1.9),11.25rem)]",
      )}
      style={{
        clipPath:
          "polygon(0% 100%,100% 100%,100% 95%,93% 92%,82% 78%,71% 54%,61% 18%,49% 0%,39% 18%,29% 54%,18% 78%,7% 92%,0% 95%)",
        WebkitClipPath:
          "polygon(0% 100%,100% 100%,100% 95%,93% 92%,82% 78%,71% 54%,61% 18%,49% 0%,39% 18%,29% 54%,18% 78%,7% 92%,0% 95%)",
      }}
      aria-hidden
    />
  );
}

/**
 * Triple band on the dome outline (cream / gold / cream) — full perimeter of the half-dome.
 * `overflow-visible`: required so stroke isn’t clipped at apex and bottom corners (was breaking continuity).
 */
function HeroDomeGoldRim() {
  const creamOuter = "color-mix(in oklch, var(--cream) 58%, var(--gold))";
  const goldMid = "color-mix(in oklch, var(--gold) 68%, oklch(0.4 0.06 55))";
  const creamInner = "color-mix(in oklch, var(--cream) 42%, white)";
  const common = {
    d: HERO_DOME_PATH_VIEWBOX,
    fill: "none" as const,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    shapeRendering: "geometricPrecision" as const,
  };
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[8] block h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path {...common} stroke={creamOuter} strokeWidth={4.4} opacity={0.5} />
      <path {...common} stroke={goldMid} strokeWidth={2.05} opacity={0.92} />
      <path {...common} stroke={creamInner} strokeWidth={0.88} opacity={0.78} />
    </svg>
  );
}

const INTERVAL_MS = 5500;
const CROSSFADE_MS = 1100;

function BranchStem({ strokeWidth = 1.15, className }: { strokeWidth?: number; className?: string }) {
  return (
    <g
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      className={className}
    >
      <path d="M 14 142 C 40 106 54 82 74 54 C 90 34 114 18 146 8" />
      <path d="M 52 94 C 46 92 46 82 54 82 C 56 88 54 94 52 94" />
      <path d="M 62 74 C 56 76 54 68 62 66 C 64 72 64 74 62 74" />
      <path d="M 76 54 C 70 54 72 46 80 46 C 80 52 78 54 76 54" />
      <path d="M 88 38 C 82 42 76 38 82 30 C 86 34 88 38 88 38" />
      <path d="M 106 26 C 100 28 96 22 104 18 C 108 22 106 26 106 26" />
      <path d="M 38 118 C 32 118 34 106 42 106 C 44 114 42 118 38 118" />
      <path d="M 44 132 C 40 138 46 146 54 138 C 50 130 46 132 44 132" />
    </g>
  );
}

/** Wheat/leaf line-art + soft tile on `bg-primary` — gold/champagne tint to match dome trim + logo. */
function HeroGreenBotanicalBackdrop() {
  const patternIdRaw = useId();
  const patternId = `hero-botanical-tile-${patternIdRaw.replace(/:/g, "")}`;
  const branch = <BranchStem className="text-gold/65" />;
  /** Slightly softer gold inside repeating tile */
  const patternStemClass = "text-gold/50";

  const wrap = (
    className: string,
    content: ReactNode,
    opacityClass: string,
  ) => (
    <svg
      viewBox="0 0 160 160"
      className={cn(
        "pointer-events-none absolute text-gold select-none",
        opacityClass,
        className,
      )}
      fill="none"
      aria-hidden
    >
      {content}
    </svg>
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Full-area tile */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-gold/30"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern id={patternId} width="112" height="112" patternUnits="userSpaceOnUse" patternTransform="rotate(-18 56 56)">
            <g transform="translate(4,98) rotate(-42) scale(0.34)" className={patternStemClass}>
              <BranchStem strokeWidth={1.05} />
            </g>
            <g transform="translate(78,24) rotate(128) scale(0.28) scale(-1,1)" className={patternStemClass}>
              <BranchStem strokeWidth={0.95} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} className="opacity-[0.58]" />
      </svg>

      {wrap(
        "-start-[12%] -top-[8%] h-[min(62vw,19rem)] w-[min(62vw,19rem)] sm:h-[28rem] sm:w-[28rem]",
        branch,
        "opacity-[0.9]",
      )}
      {wrap(
        "-end-[10%] -top-[8%] h-[min(58vw,18rem)] w-[min(58vw,18rem)] sm:h-[26rem] sm:w-[26rem] scale-x-[-1]",
        branch,
        "opacity-[0.75]",
      )}
      {wrap(
        "-start-[5%] -bottom-[18%] h-[min(48vw,15rem)] w-[min(48vw,15rem)] rotate-[18deg]",
        branch,
        "opacity-[0.45]",
      )}
      {wrap(
        "-end-[4%] -bottom-[20%] h-[min(44vw,14rem)] w-[min(44vw,14rem)] rotate-[-14deg] scale-x-[-1]",
        branch,
        "opacity-40",
      )}
      {wrap(
        "-start-[28%] -top-[4%] h-[min(36vw,11rem)] w-[min(36vw,11rem)] rotate-[8deg]",
        branch,
        "opacity-50",
      )}
      {wrap(
        "-end-[26%] -top-[6%] h-[min(34vw,10.5rem)] w-[min(34vw,10.5rem)] rotate-[-6deg] scale-x-[-1]",
        branch,
        "opacity-45",
      )}
      {wrap(
        "-start-[2%] top-[38%] h-[min(40vw,12rem)] w-[min(40vw,12rem)] rotate-[22deg]",
        branch,
        "opacity-35",
      )}
      {wrap(
        "-end-[1%] top-[42%] h-[min(38vw,11rem)] w-[min(38vw,11rem)] rotate-[-20deg] scale-x-[-1]",
        branch,
        "opacity-35",
      )}
      {wrap(
        "start-1/2 top-[8%] h-[min(30vw,9rem)] w-[min(30vw,9rem)] -translate-x-1/2 rotate-[54deg]",
        branch,
        "opacity-[0.32]",
      )}
      {wrap(
        "-start-[18%] top-[62%] h-[min(32vw,9.5rem)] w-[min(32vw,9.5rem)] rotate-[12deg]",
        branch,
        "opacity-38",
      )}
      {wrap(
        "-end-[16%] top-[58%] h-[min(30vw,9rem)] w-[min(30vw,9rem)] rotate-[-10deg] scale-x-[-1]",
        branch,
        "opacity-38",
      )}
      {wrap(
        "start-[12%] -bottom-[8%] h-[min(36vw,10rem)] w-[min(36vw,10rem)] rotate-[-26deg]",
        branch,
        "opacity-42",
      )}
      {wrap(
        "end-[14%] -bottom-[10%] h-[min(34vw,9.5rem)] w-[min(34vw,9.5rem)] rotate-[24deg] scale-x-[-1]",
        branch,
        "opacity-42",
      )}
    </div>
  );
}

type HeroImageShowcaseProps = {
  className?: string;
  activeIndex: number;
  onActiveIndexChange: Dispatch<SetStateAction<number>>;
};

/**
 * Hemisphere-style dome: flat base = full width, smooth bulge upward (like the chrome reference).
 * Images only inside that mask; corners above the dome stay `bg-primary` (green).
 */
export function HeroImageShowcase({ className, activeIndex, onActiveIndexChange }: HeroImageShowcaseProps) {
  const clipIdRaw = useId();
  const clipId = `hero-dome-${clipIdRaw.replace(/:/g, "")}`;
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback(
    (dir: -1 | 1) => {
      onActiveIndexChange((prev) => (prev + dir + SLIDES.length) % SLIDES.length);
    },
    [onActiveIndexChange],
  );

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      onActiveIndexChange((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, onActiveIndexChange]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX == null) return;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) go(1);
    else go(-1);
  };

  const clipUrl = `url(#${clipId})`;

  return (
    <div className={cn("pointer-events-none relative w-full bg-primary", className)} aria-roledescription="carousel" aria-label="Hero images">
      <HeroGreenBotanicalBackdrop />
      <svg width={1} height={1} className="pointer-events-none absolute start-0 top-0 opacity-0" aria-hidden focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={HERO_DOME_PATH_BB} />
          </clipPath>
        </defs>
      </svg>

      <div
        className={cn(
          "pointer-events-auto relative z-10 mx-auto w-full max-w-[100vw]",
          /* Tall hero: most of viewport height; generous caps for large monitors */
          "min-h-[30rem] h-[min(90svh,44rem)] sm:min-h-[32rem] sm:h-[min(85svh,52rem)] md:min-h-[34rem] md:h-[min(81svh,58rem)] lg:min-h-[36rem] lg:h-[min(77svh,64rem)] xl:h-[min(75svh,68rem)]",
        )}
        style={{
          clipPath: clipUrl,
          WebkitClipPath: clipUrl,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full overflow-hidden bg-warm-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(45,42,39,0.06)] md:shadow-[inset_0_1px_0_rgba(255,255,255,0.82),inset_0_-1px_0_rgba(45,42,39,0.045)]">
          {SLIDES.map((slide, i) => {
            const isOn = i === activeIndex;
            return (
              <div
                key={slide.src}
                className={cn(
                  "absolute inset-0 overflow-hidden transition-[opacity] ease-in-out motion-reduce:transition-none",
                  isOn ? "z-[1] opacity-100" : "z-0 opacity-0",
                )}
                style={{ transitionDuration: `${reduceMotion ? 0 : CROSSFADE_MS}ms` }}
                aria-hidden={!isOn}
              >
                {/* Slightly oversized frame on desktop = “zoom out” within same hero height; clip keeps cover (no blank bands). */}
                <div className="absolute inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:h-[100%] md:w-[99%] md:-translate-x-1/2 md:-translate-y-1/2">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : "low"}
                    loading={i === 0 ? "eager" : "lazy"}
                    className={cn(
                      "h-full w-full object-cover object-[50%_43%] sm:object-[50%_70%]",
                      !reduceMotion && isOn && "max-xl:motion-safe:hero-ken-burns",
                    )}
                  />
                </div>
              </div>
            );
          })}
          {/* Soft highlight rim + vignette — subtle dome sheen */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.22] via-transparent to-transparent"
            aria-hidden
          />
        </div>

        <HeroDomeGoldRim />

        <HeroBottomCreamBar />

        <div className="absolute inset-x-0 bottom-0 z-[22] flex items-center justify-center pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
          <HeroDomeLogoBadge />
        </div>
      </div>
    </div>
  );
}
