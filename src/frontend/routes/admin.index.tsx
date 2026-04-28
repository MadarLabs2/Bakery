import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
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
      supabase.from("orders").select("total"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    ]).then(([o, p, b, totals, r]) => {
      const revenue = (totals.data ?? []).reduce((s, x) => s + Number(x.total ?? 0), 0);
      setStats({
        orders: o.count ?? 0,
        products: p.count ?? 0,
        bestSellers: b.count ?? 0,
        revenue,
      });
      setRecent(r.data ?? []);
    });
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart },
    { label: "Total Products", value: stats.products, icon: Package },
    { label: "Best Sellers", value: stats.bestSellers, icon: Star },
    { label: "Revenue", value: `₪${stats.revenue.toFixed(2)}`, icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-xl font-bold mb-4">Recent Orders</h2>
        <div className="space-y-2">
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
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
                <div className="font-semibold">₪{Number(o.total).toFixed(2)}</div>
                <div className="text-xs capitalize text-muted-foreground">{o.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
