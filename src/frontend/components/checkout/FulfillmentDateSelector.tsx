import { CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import { useFulfillmentAvailability } from "@/frontend/hooks/useFulfillmentAvailability";
import { CheckoutSection } from "@/frontend/components/checkout/CheckoutSection";
import type { DeliveryMethod } from "@/frontend/lib/checkoutDelivery";

type FulfillmentDateSelectorProps = {
  method: DeliveryMethod;
  selectedIsoDate: string | null;
  onSelect: (isoDate: string, dayOfWeek: number, label: string) => void;
  error?: string | null;
};

export function FulfillmentDateSelector({
  method,
  selectedIsoDate,
  onSelect,
  error,
}: FulfillmentDateSelectorProps) {
  const { t } = useI18n();
  const { dates, loading, error: loadError } = useFulfillmentAvailability(method);

  const title = method === "pickup" ? t("choosePickupDay") : t("chooseDeliveryDay");

  return (
    <CheckoutSection
      icon={<CalendarDays className="h-5 w-5" aria-hidden />}
      title={title}
      description={t("availableDatesTitle")}
    >
      {error ? (
        <p className="mb-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#1B4332]/20 bg-[#faf8f4]/60 px-4 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-[#1B4332]" aria-hidden />
          {t("loading")}
        </div>
      ) : loadError ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm text-destructive">
          {t("noAvailableDates")}
        </p>
      ) : dates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#1B4332]/25 bg-[#faf8f4]/60 px-4 py-4 text-sm text-muted-foreground">
          {t("noAvailableDates")}
        </p>
      ) : (
        <div
          className="grid gap-2.5 sm:grid-cols-2"
          role="radiogroup"
          aria-label={title}
        >
          {dates.map((option) => {
            const selected = selectedIsoDate === option.isoDate;
            return (
              <button
                key={option.isoDate}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(option.isoDate, option.dayOfWeek, option.label)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-start transition-all duration-300",
                  "hover:border-[#1B4332]/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/50 focus-visible:ring-offset-2",
                  selected
                    ? "border-[#1B4332] bg-[#1B4332]/[0.07] shadow-sm ring-1 ring-[#1B4332]/20"
                    : "border-stone-200/90 bg-gradient-to-br from-[#faf8f4] to-white",
                )}
              >
                <span className="font-display text-sm font-semibold leading-snug text-[#1B4332] sm:text-base">
                  {option.label}
                </span>
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    selected ? "border-[#1B4332] bg-[#1B4332]" : "border-stone-300 bg-white",
                  )}
                  aria-hidden
                >
                  {selected ? <span className="h-2 w-2 rounded-full bg-[#faf8f4]" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </CheckoutSection>
  );
}
