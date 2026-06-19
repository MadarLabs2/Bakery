import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchActiveRestDays,
  isTodayRestDay,
  type RestDayRow,
} from "@/frontend/lib/restDays";

type UseRestDaysResult = {
  restDays: RestDayRow[];
  loading: boolean;
  error: string | null;
  isTodayRestDay: boolean;
  refresh: () => Promise<void>;
};

export function useRestDays(): UseRestDaysResult {
  const [restDays, setRestDays] = useState<RestDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchActiveRestDays();
    if (!result.ok) {
      setRestDays([]);
      setError(result.message);
      setLoading(false);
      return;
    }
    setRestDays(result.rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const todayClosed = useMemo(() => isTodayRestDay(restDays), [restDays]);

  return { restDays, loading, error, isTodayRestDay: todayClosed, refresh };
}
