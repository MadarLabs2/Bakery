import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/frontend/lib/utils";

export type ScrollRevealVariant = "tilt-up" | "tilt-left" | "tilt-right" | "zoom";

const transforms: Record<
  ScrollRevealVariant,
  { rest: string; active: string }
> = {
  "tilt-up": {
    rest: "perspective(1100px) rotateX(11deg) translateY(2.25rem) translateZ(-40px)",
    active: "perspective(1100px) rotateX(0deg) translateY(0) translateZ(0)",
  },
  "tilt-left": {
    rest: "perspective(1000px) rotateY(-9deg) translateX(-1.25rem) translateZ(-24px)",
    active: "perspective(1000px) rotateY(0deg) translateX(0) translateZ(0)",
  },
  "tilt-right": {
    rest: "perspective(1000px) rotateY(9deg) translateX(1.25rem) translateZ(-24px)",
    active: "perspective(1000px) rotateY(0deg) translateX(0) translateZ(0)",
  },
  zoom: {
    rest: "perspective(1200px) scale(0.94) translateZ(-28px)",
    active: "perspective(1200px) scale(1) translateZ(0)",
  },
};

/**
 * Scroll-triggered 3D-style reveal (perspective + rotate + translateZ).
 * Respects `prefers-reduced-motion` via CSS (see styles.css `.scroll-reveal-3d`).
 */
export function ScrollReveal3D({
  children,
  className,
  variant = "tilt-up",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setShown(true);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { rest, active } = transforms[variant];

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal-3d will-change-transform", className)}
      style={{
        transform: shown ? active : rest,
        opacity: shown ? 1 : 0,
        transitionProperty: "transform, opacity",
        transitionDuration: "0.85s, 0.65s",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1), ease-out",
        transitionDelay: `${delayMs}ms`,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  );
}
