import { CalendarOff } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";

export function CheckoutRestDayBanner() {
  const { t } = useI18n();

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm"
      role="alert"
    >
      <CalendarOff className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="font-display text-sm font-semibold">{t("restDaysTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed">{t("bakeryClosedToday")}</p>
      </div>
    </div>
  );
}
