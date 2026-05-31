import { Tag, X, Loader2 } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { cn } from "@/frontend/lib/utils";
import { CheckoutSection } from "./CheckoutSection";

type CouponBoxProps = {
  code: string;
  onCodeChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  applying?: boolean;
  appliedCode: string | null;
  discount: number;
  statusMessage?: { type: "success" | "error"; text: string } | null;
};

export function CouponBox({
  code,
  onCodeChange,
  onApply,
  onRemove,
  applying = false,
  appliedCode,
  discount,
  statusMessage,
}: CouponBoxProps) {
  const { t } = useI18n();

  return (
    <CheckoutSection icon={<Tag className="h-5 w-5" />} title={t("checkoutCouponSection")}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder={t("couponCode")}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="h-11 flex-1"
          disabled={!!appliedCode && !statusMessage}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 border-[#1B4332]/30 px-6 hover:bg-[#1B4332]/5"
          onClick={onApply}
          disabled={!code.trim() || applying || !!appliedCode}
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : t("applyCoupon")}
        </Button>
      </div>

      {statusMessage ? (
        <p
          role="alert"
          className={cn(
            "mt-2 rounded-lg px-3 py-2 text-sm",
            statusMessage.type === "success"
              ? "bg-[#1B4332]/10 text-[#1B4332]"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {statusMessage.text}
        </p>
      ) : null}

      {appliedCode ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#1B4332]/15 bg-[#faf8f4] px-3 py-2.5">
          <div className="min-w-0 text-sm">
            <p className="font-medium text-[#1B4332]">
              {t("couponAppliedSuccess")} · <span className="font-mono">{appliedCode}</span>
            </p>
            {discount > 0 ? (
              <p className="text-xs text-[#2f6a4f]" dir="ltr">
                −₪{discount.toFixed(2)}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0 px-2" onClick={onRemove}>
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">{t("couponRemoveAria")}</span>
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{t("checkoutOneCoupon")}</p>
      )}
    </CheckoutSection>
  );
}
