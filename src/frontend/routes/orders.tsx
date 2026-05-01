import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/backend/db/client";
import { useAuth } from "@/frontend/lib/auth";
import { useI18n } from "@/frontend/lib/i18n";
import { format } from "date-fns";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

function OrdersPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold">{t("myOrders")}</h1>
      <div className="mt-8 space-y-4">
        {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
        {orders.map((o) => (
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
      </div>
    </div>
  );
}
