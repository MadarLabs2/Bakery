import { useCallback, useEffect, useState } from "react";
import { fetchActiveDeliveryPlaces, type DeliveryPlaceRow } from "@/frontend/lib/deliveryPlaces";

type UseDeliveryPlacesResult = {
  places: DeliveryPlaceRow[];
  loading: boolean;
  error: string | null;
  deliveryAvailable: boolean;
  refresh: () => Promise<void>;
};

export function useDeliveryPlaces(): UseDeliveryPlacesResult {
  const [places, setPlaces] = useState<DeliveryPlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchActiveDeliveryPlaces();
    if (!result.ok) {
      setPlaces([]);
      setError(result.message);
      setLoading(false);
      return;
    }
    setPlaces(result.rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    places,
    loading,
    error,
    deliveryAvailable: places.length > 0,
    refresh,
  };
}
