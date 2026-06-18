import { CalendarClock, MapPin, Pencil } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import { CheckoutSection } from "@/frontend/components/checkout/CheckoutSection";
import { formatDeliveryAddressShort, type DeliveryAddressFields, type DeliveryMethod } from "@/frontend/lib/checkoutDelivery";
import type { FulfillmentScheduleSelection } from "@/frontend/lib/fulfillmentDays";

type FulfillmentScheduleSummaryProps = {
  method: DeliveryMethod;
  schedule: FulfillmentScheduleSelection | null;
  deliveryAddress?: DeliveryAddressFields;
  addressComplete?: boolean;
  error?: string | null;
  onChangeSchedule: () => void;
  onChangeAddress?: () => void;
};

export function FulfillmentScheduleSummary({
  method,
  schedule,
  deliveryAddress,
  addressComplete,
  error,
  onChangeSchedule,
  onChangeAddress,
}: FulfillmentScheduleSummaryProps) {
  const { t } = useI18n();

  return (
    <CheckoutSection
      icon={<CalendarClock className="h-5 w-5" aria-hidden />}
      title={method === "pickup" ? t("choosePickupTime") : t("chooseDeliveryTime")}
    >
      {error ? (
        <p className="mb-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {method === "delivery" && deliveryAddress && addressComplete ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#1B4332]/15 bg-[#faf8f4]/70 p-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1B4332]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2f6a4f]">
              {t("deliveryAddressSaved")}
            </p>
            <p className="mt-1 text-sm font-medium leading-snug text-[#1B4332]">
              {formatDeliveryAddressShort(deliveryAddress)}
            </p>
          </div>
          {onChangeAddress ? (
            <button
              type="button"
              onClick={onChangeAddress}
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#2f6a4f] hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              {t("changeAddress")}
            </button>
          ) : null}
        </div>
      ) : null}

      {schedule ? (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-2xl border border-[#1B4332]/20 bg-gradient-to-br from-[#faf8f4] to-white p-4 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <p className="text-sm font-medium leading-relaxed text-[#1B4332]">{schedule.summaryLabel}</p>
          <button
            type="button"
            onClick={onChangeSchedule}
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-[#2f6a4f] hover:underline sm:self-center"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            {t("changeTime")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onChangeSchedule}
          className="w-full rounded-2xl border-2 border-dashed border-[#1B4332]/35 bg-[#faf8f4]/80 px-4 py-4 text-sm font-medium text-[#1B4332] transition-colors hover:border-[#1B4332] hover:bg-[#1B4332]/5"
        >
          {t("scheduleNotSelected")}
        </button>
      )}
    </CheckoutSection>
  );
}
