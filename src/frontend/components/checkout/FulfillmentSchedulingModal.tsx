import { useEffect, useState } from "react";
import { CalendarClock, ChevronLeft, Loader2, Store, Truck } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import { useFulfillmentAvailability } from "@/frontend/hooks/useFulfillmentAvailability";
import {
  buildCheckoutScheduleSummary,
  formatTimeDisplay,
  type FulfillmentScheduleSelection,
  type FulfillmentType,
} from "@/frontend/lib/fulfillmentDays";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";

type Step = "date" | "time";

type FulfillmentSchedulingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fulfillmentType: FulfillmentType;
  onConfirm: (selection: FulfillmentScheduleSelection) => void;
  initialSelection?: FulfillmentScheduleSelection | null;
};

export function FulfillmentSchedulingModal({
  open,
  onOpenChange,
  fulfillmentType,
  onConfirm,
  initialSelection,
}: FulfillmentSchedulingModalProps) {
  const { t, lang } = useI18n();
  const { dates, loading, error, getSlotsForDay } = useFulfillmentAvailability(fulfillmentType);

  const [step, setStep] = useState<Step>("date");
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialSelection?.isoDate && initialSelection?.timeValue) {
      setStep("time");
      setSelectedIsoDate(initialSelection.isoDate);
      setSelectedDayOfWeek(initialSelection.dayOfWeek);
      setSelectedTime(initialSelection.timeValue);
      return;
    }
    setStep("date");
    setSelectedIsoDate(initialSelection?.isoDate ?? null);
    setSelectedDayOfWeek(initialSelection?.dayOfWeek ?? null);
    setSelectedTime(initialSelection?.timeValue ?? null);
  }, [open, initialSelection]);

  const title =
    fulfillmentType === "pickup" ? t("choosePickupTime") : t("chooseDeliveryTime");
  const HeaderIcon = fulfillmentType === "pickup" ? Store : Truck;

  const selectedDateLabel =
    dates.find((d) => d.isoDate === selectedIsoDate)?.label ?? null;

  const timeSlots =
    selectedDayOfWeek != null ? getSlotsForDay(selectedDayOfWeek) : [];

  const handleConfirm = () => {
    if (!selectedIsoDate || selectedDayOfWeek == null || !selectedTime) return;
    const summaryLabel = buildCheckoutScheduleSummary(
      fulfillmentType,
      selectedIsoDate,
      selectedDayOfWeek,
      selectedTime,
      lang,
    );
    onConfirm({
      isoDate: selectedIsoDate,
      dayOfWeek: selectedDayOfWeek,
      timeValue: selectedTime,
      summaryLabel,
    });
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
                    {t("schedulingChoosePrompt")}
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
            ) : step === "date" ? (
              <div className="space-y-2.5">
                <p className="checkout-delivery-dialog-subtitle flex items-center gap-1.5 text-xs font-medium text-[#1B4332]">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {t("selectDate")}
                </p>
                {dates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("noAvailableDates")}</p>
                ) : (
                  <div
                    className="checkout-dialog-stagger grid gap-1.5"
                    role="radiogroup"
                    aria-label={t("selectDate")}
                  >
                    {dates.map((option) => {
                      const selected = selectedIsoDate === option.isoDate;
                      return (
                        <button
                          key={option.isoDate}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => {
                            setSelectedIsoDate(option.isoDate);
                            setSelectedDayOfWeek(option.dayOfWeek);
                            setSelectedTime(null);
                            setStep("time");
                          }}
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
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="checkout-delivery-dialog-subtitle flex min-w-0 items-center gap-1.5 text-xs font-medium text-[#1B4332]">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{t("availableTimesTitle")}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("date")}
                    className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[#2f6a4f] transition-colors hover:text-[#1B4332]"
                  >
                    <ChevronLeft className="h-3 w-3 rtl:rotate-180" aria-hidden />
                    {t("schedulingBack")}
                  </button>
                </div>

                {selectedDateLabel ? (
                  <p className="rounded-md bg-[#1B4332]/[0.06] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-[#1B4332]">
                    {selectedDateLabel}
                  </p>
                ) : null}

                {timeSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t("noAvailableTimes")}</p>
                ) : (
                  <div
                    className="checkout-dialog-stagger grid grid-cols-3 gap-1.5"
                    role="radiogroup"
                    aria-label={t("selectTime")}
                  >
                    {timeSlots.map((time) => {
                      const selected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-center text-xs font-semibold tabular-nums transition-all duration-300",
                            "hover:border-[#1B4332]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/40",
                            selected
                              ? "border-[#1B4332] bg-[#1B4332] text-white shadow-sm"
                              : "border-stone-200/90 bg-white text-[#1B4332]",
                          )}
                          dir="ltr"
                        >
                          {formatTimeDisplay(time)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="checkout-delivery-dialog-footer shrink-0 flex-row gap-2 border-t border-[#1B4332]/10 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 flex-1 border-[#1B4332]/25 text-sm transition-all duration-300 hover:border-[#1B4332]/50 sm:flex-none sm:px-4"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            {step === "time" ? (
              <Button
                type="button"
                size="sm"
                className="checkout-confirm-btn h-9 flex-1 bg-[#1B4332] text-sm hover:bg-[#1B4332]/90 sm:flex-none sm:px-4"
                disabled={!selectedTime}
                onClick={handleConfirm}
              >
                {t("schedulingConfirm")}
              </Button>
            ) : null}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
