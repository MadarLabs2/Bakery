import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { useI18n } from "@/frontend/lib/i18n";
import { CheckoutSection } from "./CheckoutSection";

/** Card payments are not integrated — only cash is selectable. */
export const CARD_PAYMENT_AVAILABLE = false;

export type PaymentMethod = "cash" | "card";

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

function PayCard({
  selected,
  disabled,
  onSelect,
  icon,
  title,
  description,
  badge,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative flex w-full flex-col items-start gap-3 rounded-2xl border-2 p-4 text-start transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-stone-200 bg-stone-50/80 opacity-75"
          : "hover:border-[#1B4332]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/50 focus-visible:ring-offset-2",
        selected && !disabled
          ? "border-[#1B4332] bg-[#1B4332]/[0.06] shadow-md ring-1 ring-[#1B4332]/20"
          : !disabled && "border-stone-200/90 bg-gradient-to-br from-[#faf8f4] to-white",
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            selected && !disabled ? "bg-[#1B4332] text-[#faf8f4]" : "bg-[#1B4332]/10 text-[#1B4332]",
          )}
        >
          {icon}
        </div>
        {!disabled ? (
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              selected ? "border-[#1B4332] bg-[#1B4332]" : "border-stone-300 bg-white",
            )}
            aria-hidden
          >
            {selected ? <span className="h-2 w-2 rounded-full bg-[#faf8f4]" /> : null}
          </span>
        ) : null}
      </div>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-[#1B4332]">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {badge ? (
          <span className="mt-1 inline-block rounded-full bg-[#c9a227]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6b4e2e]">
            {badge}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const { t } = useI18n();

  return (
    <CheckoutSection icon={<Banknote className="h-5 w-5" />} title={t("paymentMethod")}>
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t("paymentMethod")}>
        <PayCard
          selected={value === "cash"}
          onSelect={() => onChange("cash")}
          icon={<Banknote className="h-5 w-5" aria-hidden />}
          title={t("cashOnDeliveryTitle")}
          description={t("cashOnDeliveryDesc")}
        />
        <PayCard
          selected={value === "card"}
          disabled={!CARD_PAYMENT_AVAILABLE}
          onSelect={() => {
            if (CARD_PAYMENT_AVAILABLE) onChange("card");
          }}
          icon={<CreditCard className="h-5 w-5" aria-hidden />}
          title={t("creditCard")}
          description={t("cardPaymentComingSoon")}
          badge={t("comingSoon")}
        />
      </div>
    </CheckoutSection>
  );
}
