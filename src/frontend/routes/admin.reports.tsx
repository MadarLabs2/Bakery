import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/backend/db/client";
import { useI18n } from "@/frontend/lib/i18n";
import { adminOrderStatusLabel } from "@/frontend/lib/adminLabels";
import { AdminBackNav } from "@/frontend/components/admin/AdminBackNav";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ orders: 0, products: 0, bestSellers: 0, revenue: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_best_seller", true),
      supabase.from("orders").select("total_amount"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    ]).then(([o, p, b, totals, r]) => {
      const revenue = (totals.data ?? []).reduce((s, x) => s + Number(x.total_amount ?? 0), 0);
      setStats({
        orders: o.count ?? 0,
        products: p.count ?? 0,
        bestSellers: b.count ?? 0,
        revenue,
      });
      setRecent(r.data ?? []);
    });
  }, []);

  const metricSquares = [
    { titleKey: "adminMetricRevenue" as const, value: `₪${stats.revenue.toFixed(2)}`, icon: TrendingUp },
    {
      titleKey: "adminMetricBestSellers" as const,
      value: stats.bestSellers,
      icon: Star,
    },
    { titleKey: "adminMetricTotalProducts" as const, value: stats.products, icon: Package },
    { titleKey: "adminMetricTotalOrders" as const, value: stats.orders, icon: ShoppingCart },
  ];

  return (
    <div className="space-y-10 p-6 md:p-8">
      <AdminBackNav />
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {t("adminDashReportsTitle")}
      </h1>

      <section className="space-y-4" aria-labelledby="reports-metric-heading">
        <h2 id="reports-metric-heading" className="sr-only">
          {t("adminMetricsOverviewSr")}
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metricSquares.map((c) => (
            <div
              key={c.titleKey}
              className="flex aspect-square min-h-0 min-w-0 flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <c.icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0 text-end text-sm leading-snug text-muted-foreground">
                  {t(c.titleKey)}
                </span>
              </div>
              <div className="min-w-0 pt-2 text-end font-display text-2xl font-bold tabular-nums leading-tight sm:text-3xl">
                {c.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-xl font-bold">{t("adminRecentOrders")}</h2>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("adminNoOrdersYet")}</p>
          )}
          {recent.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between border-b py-2 last:border-0"
            >
              <div>
                <div className="font-medium">{o.customer_name}</div>
                <div className="text-xs text-muted-foreground">
                  #{o.id.slice(0, 8)} · {format(new Date(o.created_at), "PP")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₪{Number(o.total_amount).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {adminOrderStatusLabel(o.order_status, t)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
