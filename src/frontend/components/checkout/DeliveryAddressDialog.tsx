import { MapPin, Truck } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import { cn } from "@/frontend/lib/utils";
import { isDeliveryAddressComplete, type DeliveryAddressFields } from "@/frontend/lib/checkoutDelivery";
import type { DeliveryFieldErrors } from "@/frontend/components/DeliveryMethodSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Button } from "@/frontend/components/ui/button";

type DeliveryAddressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryFee: number;
  address: DeliveryAddressFields;
  onAddressChange: (patch: Partial<DeliveryAddressFields>) => void;
  fieldErrors?: DeliveryFieldErrors;
  onConfirm: () => void;
};

export function DeliveryAddressFormFields({
  address,
  onAddressChange,
  fieldErrors,
  idPrefix = "delivery",
  stagger = true,
}: {
  address: DeliveryAddressFields;
  onAddressChange: (patch: Partial<DeliveryAddressFields>) => void;
  fieldErrors?: DeliveryFieldErrors;
  idPrefix?: string;
  stagger?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={cn("grid gap-2.5 sm:grid-cols-2 sm:gap-4", stagger && "checkout-dialog-stagger")}
    >
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-city`} className="text-xs sm:text-sm">
          {t("addressCity")}
        </Label>
        <Input
          id={`${idPrefix}-city`}
          value={address.city}
          onChange={(e) => onAddressChange({ city: e.target.value })}
          aria-invalid={!!fieldErrors?.city}
          className={cn(
            "mt-1 h-9 bg-white text-sm transition-shadow duration-200 focus-visible:ring-[#1B4332]/30 sm:mt-1.5 sm:h-10",
            fieldErrors?.city && "border-destructive",
          )}
        />
        {fieldErrors?.city ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {fieldErrors.city}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-street`} className="text-xs sm:text-sm">
          {t("addressStreet")}
        </Label>
        <Input
          id={`${idPrefix}-street`}
          value={address.street}
          onChange={(e) => onAddressChange({ street: e.target.value })}
          aria-invalid={!!fieldErrors?.street}
          className={cn(
            "mt-1 h-9 bg-white text-sm transition-shadow duration-200 focus-visible:ring-[#1B4332]/30 sm:mt-1.5 sm:h-10",
            fieldErrors?.street && "border-destructive",
          )}
        />
        {fieldErrors?.street ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {fieldErrors.street}
          </p>
        ) : null}
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-house`} className="text-xs sm:text-sm">
          {t("addressHouseNumber")}
        </Label>
        <Input
          id={`${idPrefix}-house`}
          value={address.houseNumber}
          onChange={(e) => onAddressChange({ houseNumber: e.target.value })}
          aria-invalid={!!fieldErrors?.houseNumber}
          className={cn(
            "mt-1 h-9 bg-white text-sm transition-shadow duration-200 focus-visible:ring-[#1B4332]/30 sm:mt-1.5 sm:h-10",
            fieldErrors?.houseNumber && "border-destructive",
          )}
        />
        {fieldErrors?.houseNumber ? (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {fieldErrors.houseNumber}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-apt`} className="text-xs sm:text-sm">
          {t("addressApartment")}
        </Label>
        <Input
          id={`${idPrefix}-apt`}
          value={address.apartment}
          onChange={(e) => onAddressChange({ apartment: e.target.value })}
          placeholder={t("optional")}
          className="mt-1 h-9 bg-white text-sm transition-shadow duration-200 focus-visible:ring-[#1B4332]/30 sm:mt-1.5 sm:h-10"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-notes`} className="text-xs sm:text-sm">
          {t("deliveryNotesLabel")}
        </Label>
        <Textarea
          id={`${idPrefix}-notes`}
          value={address.deliveryNotes}
          onChange={(e) => onAddressChange({ deliveryNotes: e.target.value })}
          placeholder={t("optional")}
          rows={2}
          className="mt-1 min-h-[4rem] resize-none bg-white text-sm transition-shadow duration-200 focus-visible:ring-[#1B4332]/30 sm:mt-1.5 sm:min-h-0"
        />
      </div>
    </div>
  );
}

export function DeliveryAddressDialog({
  open,
  onOpenChange,
  deliveryFee,
  address,
  onAddressChange,
  fieldErrors,
  onConfirm,
}: DeliveryAddressDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        overlayClassName="checkout-delivery-overlay"
        className={cn(
          "checkout-delivery-dialog",
          "flex max-h-[min(92dvh,40rem)] w-[calc(100%-1.25rem)] max-w-[22rem] flex-col gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-md",
          "data-[state=open]:animate-none data-[state=closed]:animate-none",
          "[&>button]:checkout-delivery-dialog-close [&>button]:text-[#faf8f4] [&>button]:hover:bg-white/20",
        )}
      >
        <div className="checkout-delivery-dialog-shell flex max-h-[min(92dvh,40rem)] flex-col overflow-hidden rounded-2xl border border-[#1B4332]/15 bg-white shadow-2xl shadow-[#1B4332]/20 sm:rounded-lg">
          <div className="checkout-delivery-dialog-header shrink-0 border-b border-[#1B4332]/10 bg-gradient-to-br from-[#1B4332] to-[#2d5a45] px-3.5 py-3 text-[#faf8f4] sm:px-5 sm:py-4">
            <DialogHeader className="space-y-1 text-start sm:space-y-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="checkout-delivery-dialog-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 sm:h-10 sm:w-10 sm:rounded-xl">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </div>
                <div className="checkout-delivery-dialog-heading min-w-0">
                  <DialogTitle className="font-display text-base leading-snug text-[#faf8f4] sm:text-lg">
                    {t("deliveryAddressDialogTitle")}
                  </DialogTitle>
                  <DialogDescription className="line-clamp-2 text-xs leading-snug text-[#faf8f4]/85 sm:line-clamp-none sm:text-sm">
                    {t("deliveryAddressDialogDesc")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <p
              className="checkout-delivery-dialog-badge mt-2 inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium sm:mt-2.5 sm:text-xs"
              dir="ltr"
            >
              + ₪{deliveryFee.toFixed(0)} · {t("deliveryFeeShort")}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-[#faf8f4] to-white px-3.5 py-3 sm:px-5 sm:py-4">
            <p className="checkout-delivery-dialog-subtitle mb-2.5 flex items-center gap-1.5 text-xs font-medium text-[#1B4332] sm:mb-3 sm:gap-2 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              {t("deliveryAddressSection")}
            </p>
            {open ? (
              <DeliveryAddressFormFields
                key="delivery-form-open"
                address={address}
                onAddressChange={onAddressChange}
                fieldErrors={fieldErrors}
              />
            ) : null}
          </div>

          <DialogFooter className="checkout-delivery-dialog-footer shrink-0 flex-row gap-2 border-t border-[#1B4332]/10 bg-white px-3.5 py-2.5 sm:px-5 sm:py-3.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 flex-1 border-[#1B4332]/25 text-sm transition-all duration-300 hover:border-[#1B4332]/50 sm:h-10 sm:flex-none sm:px-4"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="checkout-confirm-btn h-9 flex-1 bg-[#1B4332] text-sm hover:bg-[#1B4332]/90 sm:h-10 sm:flex-none sm:px-4"
              onClick={onConfirm}
            >
              {isDeliveryAddressComplete(address) ? t("confirmDeliveryAddress") : t("saveAndContinue")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
