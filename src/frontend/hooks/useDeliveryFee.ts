import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DELIVERY_FEE, fetchDeliveryFee } from "@/frontend/lib/storeSettings";

export function useDeliveryFee() {
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const fee = await fetchDeliveryFee();
    setDeliveryFee(fee);
    setLoading(false);
    return fee;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { deliveryFee, loading, refresh };
}
