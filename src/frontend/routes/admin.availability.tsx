import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, Loader2, Plus, Trash2, Truck } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import {
  defaultDeliveryConfig,
  defaultPickupConfig,
  fetchFullAvailability,
  formatTimeDisplay,
  getTimeSlotsForDay,
  normalizeTimeValue,
  saveFullAvailability,
  sortTimeValues,
  type DaySlotsState,
  type FulfillmentTypeConfig,
} from "@/frontend/lib/fulfillmentDays";
import { WEEKDAY_DICT_KEYS } from "@/frontend/lib/fulfillmentDays.i18n";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/frontend/lib/utils";

export const Route = createFileRoute("/admin/availability")({ component: AdminAvailabilityPage });

function FulfillmentTypeSection({
  title,
  description,
  config,
  onChange,
}: {
  title: string;
  description: string;
  config: FulfillmentTypeConfig;
  onChange: (next: FulfillmentTypeConfig) => void;
}) {
  const { t } = useI18n();
  const [draftTimes, setDraftTimes] = useState<Record<number, string>>({});

  const toggleDay = (dayOfWeek: number) => {
    onChange({
      ...config,
      days: { ...config.days, [dayOfWeek]: !config.days[dayOfWeek] },
    });
  };

  const removeSlot = (dayOfWeek: number, time: string) => {
    const nextSlots: DaySlotsState = { ...config.slots };
    nextSlots[dayOfWeek] = getTimeSlotsForDay(nextSlots, dayOfWeek).filter((slot) => slot !== time);
    onChange({ ...config, slots: nextSlots });
  };

  const addSlot = (dayOfWeek: number) => {
    const raw = draftTimes[dayOfWeek] ?? "09:00";
    const normalized = normalizeTimeValue(raw);
    if (!normalized) {
      toast.error(t("adminInvalidTimeSlot"));
      return;
    }
    const existing = getTimeSlotsForDay(config.slots, dayOfWeek);
    if (existing.includes(normalized)) {
      toast.error(t("adminDuplicateTimeSlot"));
      return;
    }
    const nextSlots: DaySlotsState = { ...config.slots };
    nextSlots[dayOfWeek] = sortTimeValues([...existing, normalized]);
    onChange({ ...config, slots: nextSlots });
    setDraftTimes((prev) => ({ ...prev, [dayOfWeek]: normalized }));
  };

  const enabledDays = WEEKDAY_DICT_KEYS.map((key, dayOfWeek) => ({
    key,
    dayOfWeek,
    enabled: config.days[dayOfWeek] ?? false,
    slots: getTimeSlotsForDay(config.slots, dayOfWeek),
  })).filter((d) => d.enabled);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-sm font-semibold text-[#1B4332] sm:text-base">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Compact weekday toggles — single row */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAY_DICT_KEYS.map((key, dayOfWeek) => {
          const enabled = config.days[dayOfWeek] ?? false;
          const shortLabel = t(key).replace(/^יום\s/, "").slice(0, 3);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={enabled}
              title={t(key)}
              onClick={() => toggleDay(dayOfWeek)}
              className={cn(
                "rounded-lg border px-0.5 py-1.5 text-center text-[10px] font-semibold leading-tight transition-all sm:py-2 sm:text-[11px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/40",
                enabled
                  ? "border-[#1B4332] bg-[#1B4332] text-white shadow-sm"
                  : "border-stone-200/90 bg-white text-[#1B4332]/55 hover:border-[#1B4332]/30 hover:bg-[#faf8f4]",
              )}
            >
              <span className="hidden sm:inline">{t(key)}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Time slots — only for enabled days, compact rows */}
      {enabledDays.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50/80 px-3 py-2 text-xs text-muted-foreground">
          {t("availabilityMinOneDay")}
        </p>
      ) : (
        <div className="divide-y divide-[#1B4332]/8 rounded-xl border border-[#1B4332]/12 bg-[#faf8f4]/40">
          {enabledDays.map(({ key, dayOfWeek, slots }) => (
            <div key={key} className="px-2.5 py-2 sm:px-3 sm:py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#1B4332]">{t(key)}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {slots.length} {t("timeSlotsTitle").toLowerCase()}
                </span>
              </div>

              {slots.length === 0 ? (
                <p className="mb-1.5 text-[11px] text-amber-800">{t("adminEnabledDayNeedsSlot")}</p>
              ) : (
                <ul className="mb-1.5 flex flex-wrap gap-1">
                  {slots.map((time) => (
                    <li key={time}>
                      <span className="inline-flex h-6 items-center gap-0.5 rounded-md border border-[#1B4332]/15 bg-white pe-0.5 ps-1.5 text-[11px] font-semibold tabular-nums text-[#1B4332]">
                        <Clock className="h-2.5 w-2.5 opacity-50" aria-hidden />
                        <span dir="ltr">{formatTimeDisplay(time)}</span>
                        <button
                          type="button"
                          onClick={() => removeSlot(dayOfWeek, time)}
                          className="rounded p-0.5 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
                          aria-label={t("removeTimeSlot")}
                        >
                          <Trash2 className="h-2.5 w-2.5" aria-hidden />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-1.5">
                <Input
                  type="time"
                  value={draftTimes[dayOfWeek] ?? "09:00"}
                  onChange={(e) =>
                    setDraftTimes((prev) => ({ ...prev, [dayOfWeek]: e.target.value }))
                  }
                  className="h-7 w-[5.5rem] shrink-0 px-1.5 text-[11px] sm:h-8 sm:w-24"
                  dir="ltr"
                  aria-label={t("addTimeSlot")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 border-[#1B4332]/20 px-2 text-[11px] sm:h-8"
                  onClick={() => addSlot(dayOfWeek)}
                >
                  <Plus className="h-3 w-3" aria-hidden />
                  {t("addTimeSlot")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminAvailabilityPage() {
  const { t } = useI18n();
  const [pickup, setPickup] = useState<FulfillmentTypeConfig>(defaultPickupConfig());
  const [delivery, setDelivery] = useState<FulfillmentTypeConfig>(defaultDeliveryConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchFullAvailability();
      if (cancelled) return;
      if (!result.ok) {
        const msg = result.message;
        const missingDays = msg.includes("fulfillment_available_days");
        const missingSlots = msg.includes("fulfillment_time_slots");
        setNeedsMigration(missingDays || missingSlots);
        setLoadError(
          missingSlots
            ? t("adminOrderAvailabilityMigrationHintTime")
            : missingDays
              ? t("adminOrderAvailabilityMigrationHint")
              : msg,
        );
        toast.error(t("adminOrderAvailabilityLoadError"));
        setLoading(false);
        return;
      }
      setLoadError(null);
      setNeedsMigration(false);
      setPickup(result.config.pickup);
      setDelivery(result.config.delivery);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const save = async () => {
    setSaving(true);
    const result = await saveFullAvailability({ pickup, delivery });
    setSaving(false);

    if (!result.ok) {
      if (result.message === "MIN_ONE_DAY_REQUIRED") {
        toast.error(t("availabilityMinOneDay"));
      } else if (result.message === "ENABLED_DAY_NEEDS_SLOT") {
        toast.error(t("adminEnabledDayNeedsSlot"));
      } else {
        toast.error(result.message);
      }
      return;
    }

    toast.success(t("availabilitySavedSuccess"));
  };

  return (
    <div className="admin-page-enter mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-8">
      <div className="admin-header-enter">
        <h1 className="font-display text-3xl font-bold text-[#1B4332]">{t("adminOrderAvailabilityTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("adminOrderAvailabilitySubtitle")}</p>
      </div>

      <section
        className="admin-section-enter overflow-hidden rounded-2xl border border-[#1B4332]/10 bg-white shadow-sm"
        style={{ animationDelay: "120ms" }}
      >
        <div className="border-b border-[#1B4332]/10 bg-gradient-to-br from-[#1B4332] to-[#2d5a45] px-5 py-5 text-[#faf8f4] sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">{t("orderAvailabilityTitle")}</h2>
              <p className="mt-0.5 text-sm text-[#faf8f4]/85">{t("adminOrderAvailabilitySubtitle")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("loading")}
            </div>
          ) : loadError ? (
            <div
              className={cn(
                "rounded-xl border px-4 py-4 text-sm leading-relaxed",
                needsMigration
                  ? "border-amber-300/80 bg-amber-50 text-amber-950"
                  : "border-destructive/30 bg-destructive/5 text-destructive",
              )}
              role="alert"
            >
              <p className="font-semibold">{t("adminOrderAvailabilityLoadError")}</p>
              <p className="mt-2">{loadError}</p>
            </div>
          ) : (
            <>
              <FulfillmentTypeSection
                title={t("pickupAvailabilityTitle")}
                description={t("choosePickupDay")}
                config={pickup}
                onChange={setPickup}
              />

              <div className="border-t border-[#1B4332]/10 pt-5">
                <FulfillmentTypeSection
                  title={t("deliveryAvailabilityTitle")}
                  description={t("chooseDeliveryDay")}
                  config={delivery}
                  onChange={setDelivery}
                />
              </div>

              <Button
                type="button"
                className="h-9 bg-[#1B4332] px-5 text-sm hover:bg-[#1B4332]/90"
                onClick={() => void save()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
                    {t("adminOrderAvailabilitySaving")}
                  </>
                ) : (
                  t("adminOrderAvailabilitySave")
                )}
              </Button>
            </>
          )}
        </div>
      </section>

      <section
        className="admin-section-enter rounded-2xl border border-dashed border-[#1B4332]/20 bg-[#faf8f4]/60 p-5"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex gap-3">
          <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#1B4332]" aria-hidden />
          <p className="text-sm leading-relaxed text-muted-foreground">{t("adminOrderAvailabilityNote")}</p>
        </div>
      </section>
    </div>
  );
}
