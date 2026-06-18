import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/frontend/lib/i18n";
import {
  buildAvailableDateOptions,
  fetchAvailabilityByType,
  getTimeSlotsForDay,
  type AvailableDateOption,
  type DaySlotsState,
  type FulfillmentType,
} from "@/frontend/lib/fulfillmentDays";
import { fulfillmentDaysDict } from "@/frontend/lib/fulfillmentDays.i18n";

type UseFulfillmentAvailabilityResult = {
  dates: AvailableDateOption[];
  slots: DaySlotsState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getSlotsForDay: (dayOfWeek: number) => string[];
};

export function useFulfillmentAvailability(
  fulfillmentType: FulfillmentType,
): UseFulfillmentAvailabilityResult {
  const { lang } = useI18n();
  const [dates, setDates] = useState<AvailableDateOption[]>([]);
  const [slots, setSlots] = useState<DaySlotsState>({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useCallback(
    (key: keyof typeof fulfillmentDaysDict) => fulfillmentDaysDict[key][lang],
    [lang],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchAvailabilityByType(fulfillmentType);
    if (!result.ok) {
      setDates([]);
      setSlots({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
      setError(result.message);
      setLoading(false);
      return;
    }

    setSlots(result.slots);
    setDates(buildAvailableDateOptions(result.enabledDays, t));
    setLoading(false);
  }, [fulfillmentType, t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getSlotsForDay = useCallback(
    (dayOfWeek: number) => getTimeSlotsForDay(slots, dayOfWeek),
    [slots],
  );

  return { dates, slots, loading, error, refresh, getSlotsForDay };
}
