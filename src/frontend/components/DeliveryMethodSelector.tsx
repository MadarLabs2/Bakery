import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Pencil, Phone, Store, Truck } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import {
  BAKERY_PICKUP_ADDRESS,
  BAKERY_PICKUP_PHONES,
  formatDeliveryAddressShort,
  isDeliveryAddressComplete,
  type DeliveryAddressFields,
  type DeliveryMethod,
} from "@/frontend/lib/checkoutDelivery";
import { validateDeliveryAddress as validateDeliveryFields } from "@/frontend/lib/checkoutValidation";
import { CheckoutSection } from "@/frontend/components/checkout/CheckoutSection";
import { DeliveryAddressDialog } from "@/frontend/components/checkout/DeliveryAddressDialog";
import { DeliveryPlaceSelector } from "@/frontend/components/checkout/DeliveryPlaceSelector";
import { minDeliveryPlacePrice, type DeliveryPlaceRow } from "@/frontend/lib/deliveryPlaces";

export type DeliveryFieldErrors = Partial<
  Record<keyof DeliveryAddressFields | "method" | "deliveryPlace", string>
>;

type DeliveryMethodSelectorProps = {
  method: DeliveryMethod;
  onMethodChange: (method: DeliveryMethod) => void;
  address: DeliveryAddressFields;
  onAddressChange: (patch: Partial<DeliveryAddressFields>) => void;
  fieldErrors?: DeliveryFieldErrors;
  deliveryFee: number;
  deliveryPlaces: DeliveryPlaceRow[];
  placesLoading: boolean;
  deliveryUnavailable: boolean;
  deliveryBelowMinimum: boolean;
  selectedPlaceId: string | null;
  onPlaceSelect: (id: string) => void;
  onPickupSelected?: () => void;
  onDeliveryAddressConfirmed?: () => void;
  addressDialogOpen?: boolean;
  onAddressDialogOpenChange?: (open: boolean) => void;
};

function OptionCard({
  selected,
  onSelect,
  icon,
  title,
  description,
  badge,
  disabled = false,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "checkout-method-card group relative flex w-full flex-col items-start gap-3 rounded-2xl border-2 bg-gradient-to-br from-[#faf8f4] to-white p-4 text-start shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/50 focus-visible:ring-offset-2",
        disabled
          ? "cursor-not-allowed border-stone-200/70 opacity-60"
          : "hover:border-[#1B4332]/40 hover:shadow-md",
        selected && !disabled
          ? "checkout-method-card--selected border-[#1B4332] bg-[#1B4332]/[0.06] ring-1 ring-[#1B4332]/20"
          : !disabled && "border-stone-200/90",
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            selected ? "bg-[#1B4332] text-[#faf8f4] scale-105" : "bg-[#1B4332]/10 text-[#1B4332]",
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            selected ? "border-[#1B4332] bg-[#1B4332] scale-110" : "border-stone-300 bg-white scale-100",
          )}
          aria-hidden
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-[#faf8f4]" /> : null}
        </span>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="font-display text-base font-semibold leading-snug text-[#1B4332]">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {badge ? (
          <p className="pt-0.5 text-xs font-medium text-[#6b4e2e]">{badge}</p>
        ) : null}
      </div>
    </button>
  );
}

export function DeliveryMethodSelector({
  method,
  onMethodChange,
  address,
  onAddressChange,
  fieldErrors,
  deliveryFee,
  deliveryPlaces,
  placesLoading,
  deliveryUnavailable,
  deliveryBelowMinimum,
  selectedPlaceId,
  onPlaceSelect,
  onPickupSelected,
  onDeliveryAddressConfirmed,
  addressDialogOpen,
  onAddressDialogOpenChange,
}: DeliveryMethodSelectorProps) {
  const { t } = useI18n();
  const [internalDialogOpen, setInternalDialogOpen] = useState(false);
  const deliveryDialogOpen = addressDialogOpen ?? internalDialogOpen;
  const setDeliveryDialogOpen = onAddressDialogOpenChange ?? setInternalDialogOpen;
  const [dialogErrors, setDialogErrors] = useState<DeliveryFieldErrors>({});
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const addressComplete = isDeliveryAddressComplete(address);
  const displayErrors = { ...dialogErrors, ...fieldErrors };

  useEffect(() => {
    if (addressComplete) setAddressConfirmed(true);
  }, [addressComplete]);

  useEffect(() => {
    if (method === "delivery" && fieldErrors) {
      const hasAddrErr = fieldErrors.city || fieldErrors.street || fieldErrors.houseNumber;
      if (hasAddrErr) {
        setDeliveryDialogOpen(true);
        setDialogErrors(fieldErrors);
      }
    }
  }, [fieldErrors, method]);

  const selectDelivery = () => {
    if (deliveryUnavailable || deliveryBelowMinimum) return;
    onMethodChange("delivery");
  };

  const selectPickup = () => {
    onMethodChange("pickup");
    setDeliveryDialogOpen(false);
    setDialogErrors({});
    onPickupSelected?.();
  };

  const confirmDeliveryAddress = () => {
    const result = validateDeliveryFields(address, t);
    if (!result.ok) {
      setDialogErrors(result.errors);
      return;
    }
    setDialogErrors({});
    setAddressConfirmed(true);
    setDeliveryDialogOpen(false);
    onDeliveryAddressConfirmed?.();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDeliveryDialogOpen(open);
    if (!open) setDialogErrors({});
  };

  const minPlacePrice = minDeliveryPlacePrice(deliveryPlaces);
  const deliveryDisabled = deliveryUnavailable || deliveryBelowMinimum;
  const deliveryDescription = deliveryUnavailable
    ? t("deliveryUnavailable")
    : deliveryBelowMinimum
      ? t("deliveryMinOrder")
      : t("deliveryOptionDesc");
  const deliveryBadge =
    deliveryDisabled || minPlacePrice == null
      ? undefined
      : selectedPlaceId
        ? `+ ₪${deliveryFee.toFixed(0)} · ${t("deliveryFeeShort")}`
        : `${t("deliveryFromPrice")} ₪${minPlacePrice.toFixed(0)}`;

  return (
    <CheckoutSection icon={<Truck className="h-5 w-5" />} title={t("deliveryMethodTitle")}>
      {fieldErrors?.method ? (
        <p className="mb-3 text-sm text-destructive" role="alert">
          {fieldErrors.method}
        </p>
      ) : null}

      <div
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label={t("deliveryMethodTitle")}
      >
        <OptionCard
          selected={method === "delivery"}
          onSelect={selectDelivery}
          disabled={deliveryDisabled}
          icon={<Truck className="h-5 w-5" aria-hidden />}
          title={t("deliveryOptionTitle")}
          description={deliveryDescription}
          badge={deliveryBadge}
        />
        <OptionCard
          selected={method === "pickup"}
          onSelect={selectPickup}
          icon={<Store className="h-5 w-5" aria-hidden />}
          title={t("pickupOptionTitle")}
          description={t("pickupOptionDesc")}
        />
      </div>

      {/* Delivery: place selector + address */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          method === "delivery" ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={method !== "delivery"}
      >
        <div className="overflow-hidden space-y-4">
          <DeliveryPlaceSelector
            places={deliveryPlaces}
            loading={placesLoading}
            unavailable={deliveryDisabled}
            selectedId={selectedPlaceId}
            onSelect={onPlaceSelect}
            error={fieldErrors?.deliveryPlace ?? null}
          />

          {selectedPlaceId && !deliveryDisabled ? (
            addressConfirmed && addressComplete ? (
              <button
              type="button"
              onClick={() => setDeliveryDialogOpen(true)}
              className={cn(
                "checkout-method-panel-inner flex w-full items-start gap-3 rounded-2xl border border-[#1B4332]/20 bg-gradient-to-br from-[#faf8f4] to-white p-4 text-start shadow-sm",
                "transition-all duration-300 hover:border-[#1B4332]/40 hover:shadow-md hover:-translate-y-0.5",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B4332]/10 text-[#1B4332]">
                <MapPin className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2f6a4f]">
                  {t("deliveryAddressSaved")}
                </p>
                <p className="mt-1 text-sm font-medium leading-snug text-[#1B4332]">
                  {formatDeliveryAddressShort(address)}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#2f6a4f]">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                {t("editDeliveryAddress")}
              </span>
            </button>
            ) : (
              <button
              type="button"
              onClick={() => setDeliveryDialogOpen(true)}
              className={cn(
                "checkout-method-panel-inner group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[#1B4332]/35 bg-[#faf8f4]/80 px-4 py-4 text-start",
                "transition-all duration-300 hover:border-[#1B4332] hover:bg-[#1B4332]/5 hover:-translate-y-0.5",
              )}
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#1B4332] transition-transform duration-300 group-hover:scale-110" aria-hidden />
                <span className="text-sm font-medium text-[#1B4332]">{t("addDeliveryAddress")}</span>
              </span>
              <ChevronDown className="h-5 w-5 rotate-[-90deg] text-[#1B4332]/60 transition-transform duration-300 group-hover:translate-x-[-2px]" aria-hidden />
              </button>
            )
          ) : null}
        </div>
      </div>

      {/* Pickup info — animated expand */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          method === "pickup" ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={method !== "pickup"}
      >
        <div className="overflow-hidden">
          <div
            key="pickup-panel"
            className="checkout-method-panel-inner space-y-3 rounded-2xl border border-[#c9a227]/25 bg-gradient-to-br from-[#faf8f4] to-[#f5f0e6] p-4 sm:p-5"
          >
            <p className="font-display text-sm font-semibold text-[#1B4332]">{t("pickupInfoTitle")}</p>
            <p className="text-sm leading-relaxed text-neutral-700">{t("pickupReadyMessage")}</p>
            <div className="space-y-2 text-sm text-neutral-800">
              <p>
                <span className="font-medium text-[#1B4332]">{t("brand")}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4332]" aria-hidden />
                <span>{BAKERY_PICKUP_ADDRESS}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Phone className="h-4 w-4 shrink-0 text-[#1B4332]" aria-hidden />
                {BAKERY_PICKUP_PHONES.map((num) => (
                  <a
                    key={num}
                    href={`tel:${num}`}
                    className="font-medium text-[#2f6a4f] hover:underline"
                    dir="ltr"
                  >
                    {num}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeliveryAddressDialog
        open={deliveryDialogOpen}
        onOpenChange={handleDialogOpenChange}
        deliveryFee={deliveryFee}
        address={address}
        onAddressChange={(patch) => {
          onAddressChange(patch);
          setAddressConfirmed(false);
          setDialogErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(patch) as (keyof typeof patch)[]) {
              if (key && next[key]) delete next[key];
            }
            return next;
          });
        }}
        fieldErrors={displayErrors}
        onConfirm={confirmDeliveryAddress}
      />
    </CheckoutSection>
  );
}
