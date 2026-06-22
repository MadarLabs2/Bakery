import { useCallback, useEffect, useState } from "react";
import brandLogo from "@/images/alnoor_bakery_profesional/BakeryLogo.png";
import { useI18n } from "@/frontend/lib/i18n";
import { cn } from "@/frontend/lib/utils";
import { Button } from "@/frontend/components/ui/button";

const SPLASH_DURATION_MS = 3000;
const FADE_OUT_MS = 500;
const SPLASH_SEEN_KEY = "bakery-splash-seen";

function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SplashScreen() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    window.setTimeout(() => setShow(false), FADE_OUT_MS);
  }, []);

  useEffect(() => {
    if (hasSeenSplash() || prefersReducedMotion()) return;

    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      /* private browsing / storage blocked */
    }

    setShow(true);
    const fadeTimer = window.setTimeout(() => setExiting(true), SPLASH_DURATION_MS - FADE_OUT_MS);
    const hideTimer = window.setTimeout(() => setShow(false), SPLASH_DURATION_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-warm-gradient px-6 transition-opacity duration-500 motion-reduce:transition-none",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t("brand")}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute end-4 top-4 z-10 border-primary/25 bg-background/90"
        onClick={dismiss}
      >
        {t("splashSkip")}
      </Button>

      <div
        className={cn(
          "flex max-w-sm flex-col items-center gap-5 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-700",
          exiting && "motion-safe:opacity-0",
        )}
      >
        <div className="rounded-3xl border border-primary/15 bg-background/80 p-6 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.35)] ring-2 ring-white/80 backdrop-blur-sm">
          <img
            src={brandLogo}
            alt={t("brand")}
            width={512}
            height={512}
            draggable={false}
            className="mx-auto h-auto w-[min(72vw,14rem)] max-w-full object-contain sm:w-[min(68vw,16rem)]"
          />
        </div>
        <div className="space-y-2">
          <p className="font-display text-xl font-bold leading-snug text-primary sm:text-2xl">
            {t("brand")}
          </p>
          <p className="text-sm text-muted-foreground sm:text-base">{t("tagline")}</p>
        </div>
      </div>
    </div>
  );
}
