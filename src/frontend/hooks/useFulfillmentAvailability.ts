import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/frontend/lib/i18n";
import {
  buildAvailableDateOptions,
  fetchAvailabilityByType,
  type AvailableDateOption,
  type FulfillmentType,
} from "@/frontend/lib/fulfillmentDays";
import { fulfillmentDaysDict } from "@/frontend/lib/fulfillmentDays.i18n";
import { fetchActiveRestDays, type RestDayRow } from "@/frontend/lib/restDays";

type UseFulfillmentAvailabilityResult = {
  dates: AvailableDateOption[];
  restDays: RestDayRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useFulfillmentAvailability(
  fulfillmentType: FulfillmentType,
): UseFulfillmentAvailabilityResult {
  const { lang } = useI18n();
  const [dates, setDates] = useState<AvailableDateOption[]>([]);
  const [restDays, setRestDays] = useState<RestDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useCallback(
    (key: keyof typeof fulfillmentDaysDict) => fulfillmentDaysDict[key][lang],
    [lang],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [availability, restResult] = await Promise.all([
      fetchAvailabilityByType(fulfillmentType),
      fetchActiveRestDays(),
    ]);

    if (!availability.ok) {
      setDates([]);
      setRestDays([]);
      setError(availability.message);
      setLoading(false);
      return;
    }

    const activeRestDays = restResult.ok ? restResult.rows : [];
    setRestDays(activeRestDays);
    setDates(buildAvailableDateOptions(availability.enabledDays, t, activeRestDays));
    setLoading(false);
  }, [fulfillmentType, t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { dates, restDays, loading, error, refresh };
}
