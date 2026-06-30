import { Loader2, MapPinned } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import {
  pickDeliveryPlaceName,
  type DeliveryPlaceRow,
} from "@/frontend/lib/deliveryPlaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";

type DeliveryPlaceSelectorProps = {
  places: DeliveryPlaceRow[];
  loading: boolean;
  unavailable: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  error?: string | null;
};

function DeliveryPlaceOptionLabel({
  label,
  price,
  className,
}: {
  label: string;
  price: number;
  className?: string;
}) {
  return (
    <span className={cn("flex w-full items-center justify-between gap-3 text-start", className)}>
      <span className="min-w-0 flex-1 font-medium">{label}</span>
      <span
        className="shrink-0 font-semibold tabular-nums text-[#1B4332]/80"
        dir="ltr"
        lang="en"
      >
        ₪{Number(price).toFixed(0)}
      </span>
    </span>
  );
}

export function DeliveryPlaceSelector({
  places,
  loading,
  unavailable,
  selectedId,
  onSelect,
  error,
}: DeliveryPlaceSelectorProps) {
  const { t, lang, dir } = useI18n();
  const selectedPlace = places.find((place) => place.id === selectedId) ?? null;

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
    <div className="space-y-2.5" dir={dir}>
      <label
        htmlFor="delivery-place-select"
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#2f6a4f]"
      >
        <MapPinned className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("chooseDeliveryArea")}
      </label>

      <Select value={selectedId ?? undefined} onValueChange={onSelect} dir={dir}>
        <SelectTrigger
          id="delivery-place-select"
          dir={dir}
          lang={lang}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-12 rounded-xl border-2 bg-white px-4 text-sm font-medium text-[#1B4332] shadow-none",
            "text-start focus:ring-2 focus:ring-[#1B4332]/30 focus:ring-offset-0",
            "[&>span]:w-full [&>span]:text-start",
            error
              ? "border-destructive/60 focus:ring-destructive/30"
              : "border-stone-200/90 hover:border-[#1B4332]/35 data-[state=open]:border-[#1B4332]/50",
          )}
        >
          <SelectValue placeholder={t("chooseDeliveryArea")}>
            {selectedPlace ? (
              <DeliveryPlaceOptionLabel
                label={pickDeliveryPlaceName(selectedPlace, lang)}
                price={selectedPlace.price}
              />
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          dir={dir}
          lang={lang}
          className="rounded-xl border-[#1B4332]/15 bg-white text-start shadow-lg"
          position="popper"
        >
          {places.map((place) => {
            const label = pickDeliveryPlaceName(place, lang);
            return (
              <SelectItem
                key={place.id}
                value={place.id}
                className="cursor-pointer rounded-lg py-2.5 ps-3 pe-8 text-sm focus:bg-[#1B4332]/8 focus:text-[#1B4332]"
              >
                <DeliveryPlaceOptionLabel label={label} price={place.price} />
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
