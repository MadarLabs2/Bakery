import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { useAuth } from "@/frontend/lib/auth";
import { useI18n } from "@/frontend/lib/i18n";
import { format } from "date-fns";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

const PAGE_SIZE = 5;

function OrdersPage() {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const { t } = useI18n();
  const nav = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  const fetchBatch = useCallback(
    async (offset: number, append: boolean) => {
      if (!userId) return;
      if (append) setLoadingMore(true);
      else setLoadingList(true);

      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE);

      if (append) setLoadingMore(false);
      else setLoadingList(false);

      if (error) {
        console.warn("[orders]", error.message);
        if (!append) setOrders([]);
        setHasMore(false);
        return;
      }

      const raw = data ?? [];
      const more = raw.length > PAGE_SIZE;
      const batch = more ? raw.slice(0, PAGE_SIZE) : raw;

      setHasMore(more);
      setNextOffset(offset + batch.length);

      if (append) setOrders((prev) => [...prev, ...batch]);
      else setOrders(batch);
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) {
      setOrders([]);
      setHasMore(false);
      setNextOffset(0);
      setLoadingList(false);
      return;
    }
    void fetchBatch(0, false);
  }, [userId, fetchBatch]);

  return (
    <div className="admin-page-enter container mx-auto px-4 py-10">
      <h1 className="page-title-enter font-display text-4xl font-bold" style={{ animationDelay: "30ms" }}>{t("myOrders")}</h1>
      <div className="admin-list-stagger mt-8 space-y-4">
        {loadingList && <p className="text-muted-foreground">{t("loading")}</p>}
        {!loadingList && orders.length === 0 && <p className="text-muted-foreground">{t("myOrdersEmpty")}</p>}
        {!loadingList &&
          orders.map((o) => (
            <div key={o.id} className="rounded-2xl border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">
                    #{o.id.slice(0, 8)} · {format(new Date(o.created_at), "PP")}
                  </div>
                  <div className="font-display text-lg font-semibold capitalize">{o.order_status}</div>
                </div>
                <div className="font-display text-xl font-bold text-primary">
                  ₪{Number(o.total_amount).toFixed(2)}
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {o.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity}× {it.product_name}
                    </span>
                    <span>₪{Number(it.total_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        {!loadingList && hasMore && orders.length > 0 ? (
          <div className="flex justify-center pt-2">
            <Button type="button" variant="outline" disabled={loadingMore} onClick={() => void fetchBatch(nextOffset, true)}>
              {loadingMore ? t("loading") : t("myOrdersSeeMore")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
