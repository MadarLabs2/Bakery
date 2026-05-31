import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/utils";

type CheckoutSectionProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function CheckoutSection({ icon, title, description, children, className }: CheckoutSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[#1B4332]/10 bg-gradient-to-br from-white via-white to-[#faf8f4]/50 p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B4332] text-[#faf8f4] shadow-sm"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-display text-lg font-semibold leading-snug text-[#1B4332]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
