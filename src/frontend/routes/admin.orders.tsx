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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { AdminBackNav } from "@/frontend/components/admin/AdminBackNav";
import { format } from "date-fns";
import { toast } from "sonner";
import { useI18n } from "@/frontend/lib/i18n";
import { adminOrderStatusLabel } from "@/frontend/lib/adminLabels";

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
  const { t } = useI18n();
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
      toast.success(t("updated"));
      load();
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <AdminBackNav />
      <h1 className="font-display text-3xl font-bold">{t("adminDashOrdersTitle")}</h1>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">{t("adminThOrderShort")}</th>
              <th>{t("adminThDate")}</th>
              <th>{t("adminThCustomer")}</th>
              <th>{t("adminThMethod")}</th>
              <th>{t("adminThTotal")}</th>
              <th>{t("adminThStatus")}</th>
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
                          {adminOrderStatusLabel(s, t)}
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
                <DialogTitle>
                  {t("adminOrderTitlePrefix")} #{selected.id.slice(0, 8)}
                </DialogTitle>
                <DialogDescription className="sr-only">{t("adminDialogOrderDetailSr")}</DialogDescription>
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
                <div className="space-y-1 border-t pt-3">
                  {selected.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity}× {it.product_name}
                      </span>
                      <span>₪{Number(it.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 border-t pt-2">
                  <div className="flex justify-between">
                    <span>{t("adminOrderSubtotal")}</span>
                    <span>₪{Number(selected.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(selected.discount_amount) > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>{t("adminOrderDiscountLine")}</span>
                      <span>-₪{Number(selected.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(selected.delivery_fee) > 0 && (
                    <div className="flex justify-between">
                      <span>{t("adminOrderDeliveryLine")}</span>
                      <span>₪{Number(selected.delivery_fee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg font-bold">
                    <span>{t("adminOrderTotalLine")}</span>
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
