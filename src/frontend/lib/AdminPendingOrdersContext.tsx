import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/backend/db/client";
import { playNewOrderChime } from "@/frontend/lib/orderNotificationSound";
import { ADMIN_VISIBLE_ORDERS_FILTER } from "@/frontend/lib/orderPayment";

const ACTIONABLE_STATUSES = ["pending", "confirmed"] as const;

async function fetchActionableOrderCount(): Promise<number> {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("order_status", [...ACTIONABLE_STATUSES])
    .or(ADMIN_VISIBLE_ORDERS_FILTER);
  if (error) {
    console.warn("[AdminPendingOrders]", error.message);
    return 0;
  }
  return count ?? 0;
}

type Ctx = { pendingCount: number };

const AdminPendingOrdersContext = createContext<Ctx | null>(null);

export function AdminPendingOrdersProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const lastRef = useRef(0);
  const initialisedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCount = useCallback((n: number, playOnIncrease: boolean) => {
    if (initialisedRef.current && playOnIncrease && n > lastRef.current) {
      playNewOrderChime();
    }
    lastRef.current = n;
    initialisedRef.current = true;
    setCount(n);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const pull = async (playOnIncrease: boolean) => {
      const n = await fetchActionableOrderCount();
      if (cancelled) return;
      applyCount(n, playOnIncrease);
    };

    void pull(false);

    const schedule = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void pull(true);
      }, 350);
    };

    const channel = supabase
      .channel("admin-pending-orders-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, schedule)
      .subscribe();

    const poll = window.setInterval(() => void pull(true), 25_000);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [applyCount]);

  const value = useMemo(() => ({ pendingCount: count }), [count]);

  return <AdminPendingOrdersContext.Provider value={value}>{children}</AdminPendingOrdersContext.Provider>;
}

export function useAdminPendingOrders(): Ctx {
  const v = useContext(AdminPendingOrdersContext);
  if (!v) {
    throw new Error("useAdminPendingOrders must be used within AdminPendingOrdersProvider");
  }
  return v;
}
