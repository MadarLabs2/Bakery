import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Settings, Truck } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import {
  fetchDeliveryFee,
  isValidDeliveryFeeInput,
  updateDeliveryFee,
} from "@/frontend/lib/storeSettings";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/frontend/lib/utils";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettingsPage });

function AdminSettingsPage() {
  const { t } = useI18n();
  const [feeInput, setFeeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const fee = await fetchDeliveryFee();
      if (!cancelled) {
        setFeeInput(String(fee));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = (): number | null => {
    if (!isValidDeliveryFeeInput(feeInput)) {
      setFieldError(t("adminDeliveryFeeInvalid"));
      return null;
    }
    setFieldError(null);
    return Number.parseFloat(feeInput.trim());
  };

  const save = async () => {
    const fee = validate();
    if (fee == null) return;

    setSaving(true);
    const result = await updateDeliveryFee(fee);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setFeeInput(String(fee));
    toast.success(t("adminDeliveryFeeSaved"));
  };

  return (
    <div className="admin-page-enter mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-8">
      <div className="admin-header-enter">
        <h1 className="font-display text-3xl font-bold text-[#1B4332]">{t("adminSettingsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("adminSettingsSubtitle")}</p>
      </div>

      <section className="admin-section-enter overflow-hidden rounded-2xl border border-[#1B4332]/10 bg-white shadow-sm" style={{ animationDelay: "120ms" }}>
        <div className="border-b border-[#1B4332]/10 bg-gradient-to-br from-[#1B4332] to-[#2d5a45] px-5 py-5 text-[#faf8f4] sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Truck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">{t("adminDeliverySettingsTitle")}</h2>
              <p className="mt-0.5 text-sm text-[#faf8f4]/85">{t("adminDeliverySettingsDesc")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("loading")}
            </div>
          ) : (
            <>
              <div className="max-w-xs">
                <Label htmlFor="admin-delivery-fee">{t("adminDeliveryFeeLabel")}</Label>
                <div className="relative mt-2">
                  <span
                    className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#1B4332]"
                    dir="ltr"
                  >
                    ₪
                  </span>
                  <Input
                    id="admin-delivery-fee"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={feeInput}
                    onChange={(e) => {
                      setFeeInput(e.target.value);
                      setFieldError(null);
                    }}
                    placeholder={t("adminDeliveryFeePlaceholder")}
                    className={cn(
                      "h-11 ps-9 text-base tabular-nums",
                      fieldError && "border-destructive",
                    )}
                    aria-invalid={!!fieldError}
                    dir="ltr"
                  />
                </div>
                {fieldError ? (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">
                    {fieldError}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">{t("adminDeliveryFeeHint")}</p>
                )}
              </div>

              <Button
                type="button"
                className="h-11 bg-[#1B4332] px-6 hover:bg-[#1B4332]/90"
                onClick={() => void save()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
                    {t("adminDeliveryFeeSaving")}
                  </>
                ) : (
                  t("adminDeliveryFeeSave")
                )}
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="admin-section-enter rounded-2xl border border-dashed border-[#1B4332]/20 bg-[#faf8f4]/60 p-5" style={{ animationDelay: "220ms" }}>
        <div className="flex gap-3">
          <Settings className="mt-0.5 h-5 w-5 shrink-0 text-[#1B4332]" aria-hidden />
          <p className="text-sm leading-relaxed text-muted-foreground">{t("adminDeliverySettingsNote")}</p>
        </div>
      </section>
    </div>
  );
}
