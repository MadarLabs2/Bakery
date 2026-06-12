import { useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { releasePendingCardOrder } from "@/backend/server/releasePendingCardOrder.functions";
import { useAuth } from "@/frontend/lib/auth";
import { useCart } from "@/frontend/lib/cart";
import { PENDING_CARD_ORDER_STORAGE_KEY } from "@/frontend/lib/orderPayment";

function readPendingOrderId(explicit?: string | null): string | null {
  if (explicit) return explicit;
  try {
    return sessionStorage.getItem(PENDING_CARD_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearPendingOrderStorage() {
  try {
    sessionStorage.removeItem(PENDING_CARD_ORDER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function useReleasePendingCardOrder() {
  const { session } = useAuth();
  const { refresh } = useCart();
  const releaseFn = useServerFn(releasePendingCardOrder);
  const handledRef = useRef<Set<string>>(new Set());

  const releaseIfNeeded = useCallback(
    async (explicitOrderId?: string | null): Promise<
      "none" | "released" | "already_paid" | "failed"
    > => {
      const orderId = readPendingOrderId(explicitOrderId);
      if (!orderId || !session?.access_token) return "none";
      if (handledRef.current.has(orderId)) return "released";

      const result = await releaseFn({
        data: { orderId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!result.ok) return "failed";

      handledRef.current.add(orderId);

      if (result.alreadyPaid) {
        clearPendingOrderStorage();
        return "already_paid";
      }

      if (result.released) {
        clearPendingOrderStorage();
        await refresh();
        return "released";
      }

      return "failed";
    },
    [releaseFn, session?.access_token, refresh],
  );

  return { releaseIfNeeded };
}
