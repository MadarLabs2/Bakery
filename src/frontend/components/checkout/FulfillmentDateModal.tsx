import { CalendarDays, Loader2, Store, Truck } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import { useFulfillmentAvailability } from "@/frontend/hooks/useFulfillmentAvailability";
import {
  buildCheckoutDateSummary,
  type FulfillmentDateSelection,
  type FulfillmentType,
} from "@/frontend/lib/fulfillmentDays";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";

type FulfillmentDateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fulfillmentType: FulfillmentType;
  onConfirm: (selection: FulfillmentDateSelection) => void;
  initialSelection?: FulfillmentDateSelection | null;
};

export function FulfillmentDateModal({
  open,
  onOpenChange,
  fulfillmentType,
  onConfirm,
  initialSelection,
}: FulfillmentDateModalProps) {
  const { t, lang } = useI18n();
  const { dates, loading, error } = useFulfillmentAvailability(fulfillmentType);

  const title =
    fulfillmentType === "pickup" ? t("choosePickupDate") : t("chooseDeliveryDate");
  const HeaderIcon = fulfillmentType === "pickup" ? Store : Truck;

  const handleSelect = (isoDate: string, dayOfWeek: number) => {
    const summaryLabel = buildCheckoutDateSummary(fulfillmentType, isoDate, dayOfWeek, lang);
    onConfirm({ isoDate, dayOfWeek, summaryLabel });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        overlayClassName="checkout-delivery-overlay"
        className={cn(
          "checkout-delivery-dialog",
          "flex max-h-[min(88dvh,36rem)] w-[calc(100%-1.5rem)] max-w-[20rem] flex-col gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-sm",
          "data-[state=open]:animate-none data-[state=closed]:animate-none",
          "[&>button]:checkout-delivery-dialog-close [&>button]:text-[#faf8f4] [&>button]:hover:bg-white/20",
        )}
      >
        <div className="checkout-delivery-dialog-shell flex max-h-[min(88dvh,36rem)] flex-col overflow-hidden rounded-2xl border border-[#1B4332]/15 bg-white shadow-2xl shadow-[#1B4332]/20 sm:rounded-xl">
          <div className="checkout-delivery-dialog-header shrink-0 border-b border-[#1B4332]/10 bg-gradient-to-br from-[#1B4332] to-[#2d5a45] px-3.5 py-3 text-[#faf8f4] sm:px-4 sm:py-3.5">
            <DialogHeader className="space-y-0.5 text-start">
              <div className="flex items-center gap-2.5">
                <div className="checkout-delivery-dialog-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <HeaderIcon className="h-4 w-4" aria-hidden />
                </div>
                <div className="checkout-delivery-dialog-heading min-w-0">
                  <DialogTitle className="font-display text-base leading-snug text-[#faf8f4]">
                    {title}
                  </DialogTitle>
                  <DialogDescription className="line-clamp-2 text-[11px] leading-snug text-[#faf8f4]/85 sm:text-xs">
                    {t("dateChoosePrompt")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#faf8f4] to-white px-3.5 py-3 sm:px-4 sm:py-3.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {t("loading")}
              </div>
            ) : error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-xs text-destructive">
                {t("noAvailableDates")}
              </p>
            ) : dates.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("noAvailableDates")}</p>
            ) : (
              <div className="space-y-2.5">
                <p className="checkout-delivery-dialog-subtitle flex items-center gap-1.5 text-xs font-medium text-[#1B4332]">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t("selectDate")}
                </p>
                <div
                  className="checkout-dialog-stagger grid gap-1.5"
                  role="radiogroup"
                  aria-label={t("selectDate")}
                >
                  {dates.map((option) => {
                    const selected = initialSelection?.isoDate === option.isoDate;
                    return (
                      <button
                        key={option.isoDate}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleSelect(option.isoDate, option.dayOfWeek)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-start text-xs font-medium transition-all duration-300",
                          "hover:border-[#1B4332]/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/40",
                          selected
                            ? "border-[#1B4332] bg-[#1B4332]/[0.08] text-[#1B4332] shadow-sm"
                            : "border-stone-200/90 bg-white text-[#1B4332]/90",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
