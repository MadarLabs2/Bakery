import { useAdminPendingOrders } from "@/frontend/lib/AdminPendingOrdersContext";

/**
 * Count of orders needing attention (pending / confirmed). Single shared subscription via {@link AdminPendingOrdersProvider}.
 */
export function useAdminPendingOrderCount(): number {
  return useAdminPendingOrders().pendingCount;
}
