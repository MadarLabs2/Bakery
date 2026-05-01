import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/backend/db/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/frontend/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const load = () =>
    supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      load();
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <div className="rounded-2xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">#</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-t hover:bg-muted/30 cursor-pointer"
                onClick={() => setSelected(o)}
              >
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td>{format(new Date(o.created_at), "PP p")}</td>
                <td>
                  {o.customer_name}
                  <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                </td>
                <td className="capitalize">
                  {o.delivery_method} · {o.payment_method}
                </td>
                <td className="font-semibold">₪{Number(o.total_amount).toFixed(2)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Select value={o.order_status} onValueChange={(v) => setStatus(o.id, v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selected.id.slice(0, 8)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div>
                  <b>{selected.customer_name}</b> · {selected.customer_phone} ·{" "}
                  {selected.customer_email}
                </div>
                <div className="capitalize text-muted-foreground">
                  {selected.delivery_method} / {selected.payment_method}
                </div>
                {selected.delivery_address && <div>📍 {selected.delivery_address}</div>}
                {selected.notes && (
                  <div className="rounded bg-muted p-2 text-xs">{selected.notes}</div>
                )}
                <div className="border-t pt-3 space-y-1">
                  {selected.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity}× {it.product_name}
                      </span>
                      <span>₪{Number(it.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₪{Number(selected.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(selected.discount_amount) > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-₪{Number(selected.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(selected.delivery_fee) > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>₪{Number(selected.delivery_fee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg font-bold">
                    <span>Total</span>
                    <span>₪{Number(selected.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
