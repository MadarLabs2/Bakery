import { Loader2, MapPinned } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import {
  pickDeliveryPlaceName,
  type DeliveryPlaceRow,
} from "@/frontend/lib/deliveryPlaces";

type DeliveryPlaceSelectorProps = {
  places: DeliveryPlaceRow[];
  loading: boolean;
  unavailable: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  error?: string | null;
};

export function DeliveryPlaceSelector({
  places,
  loading,
  unavailable,
  selectedId,
  onSelect,
  error,
}: DeliveryPlaceSelectorProps) {
  const { t, lang } = useI18n();

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#1B4332]/10 bg-white px-4 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {t("loading")}
      </div>
    );
  }

  if (unavailable || places.length === 0) {
    return (
      <div
        className="rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-4 text-sm text-amber-950"
        role="alert"
      >
        {t("deliveryUnavailable")}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#2f6a4f]">
        <MapPinned className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("chooseDeliveryArea")}
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div
        className="grid gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label={t("chooseDeliveryArea")}
      >
        {places.map((place) => {
          const selected = selectedId === place.id;
          const label = pickDeliveryPlaceName(place, lang);
          return (
            <button
              key={place.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(place.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-3 text-start transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/40 focus-visible:ring-offset-2",
                selected
                  ? "border-[#1B4332] bg-[#1B4332]/[0.07] shadow-sm"
                  : "border-stone-200/90 bg-white hover:border-[#1B4332]/35 hover:bg-[#faf8f4]/80",
              )}
            >
              <span className="min-w-0 flex-1 font-medium leading-snug text-[#1B4332]">{label}</span>
              <span
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums",
                  selected ? "bg-[#1B4332] text-white" : "bg-[#1B4332]/8 text-[#1B4332]",
                )}
                dir="ltr"
              >
                ₪{Number(place.price).toFixed(0)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
