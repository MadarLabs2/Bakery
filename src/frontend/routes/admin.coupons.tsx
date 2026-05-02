import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
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
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { AdminBackNav } from "@/frontend/components/admin/AdminBackNav";
import { toast } from "sonner";
import { useI18n } from "@/frontend/lib/i18n";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });

const empty = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  max_uses: null as number | null,
  expires_at: "",
  is_active: true,
};

function AdminCoupons() {
  const { t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const load = () =>
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const payload = {
      ...form,
      code: form.code.toUpperCase(),
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(t("created"));
    setOpen(false);
    setForm(empty);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("adminDeleteConfirmCoupon"))) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <AdminBackNav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold">{t("adminDashCouponsTitle")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> {t("adminBtnNewCoupon")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("adminDialogCouponNewTitle")}</DialogTitle>
              <DialogDescription className="sr-only">{t("adminDialogCouponFormSr")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>{t("adminLabelCode")}</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t("adminLabelType")}</Label>
                  <Select
                    value={form.discount_type}
                    onValueChange={(v) => setForm({ ...form, discount_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t("adminDiscountTypePercentage")}</SelectItem>
                      <SelectItem value="fixed">{t("adminDiscountTypeFixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("adminLabelValue")}</Label>
                  <Input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>{t("adminLabelMinOrder")}</Label>
                  <Input
                    type="number"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("adminLabelMaxUses")}</Label>
                  <Input
                    type="number"
                    value={form.max_uses ?? ""}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t("adminLabelExpiresAt")}</Label>
                <Input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
              <Button onClick={save} className="w-full">
                {t("adminCreate")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">{t("adminThCode")}</th>
              <th>{t("adminThType")}</th>
              <th>{t("adminThValue")}</th>
              <th>{t("adminThMin")}</th>
              <th>{t("adminThUses")}</th>
              <th>{t("adminThStatus")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="capitalize">{c.discount_type}</td>
                <td>
                  {c.discount_type === "percentage"
                    ? `${c.discount_value}%`
                    : `₪${c.discount_value}`}
                </td>
                <td>₪{c.min_order_amount}</td>
                <td>
                  {c.used_count}
                  {c.max_uses ? `/${c.max_uses}` : ""}
                </td>
                <td>{c.is_active ? t("adminActive") : t("adminInactive")}</td>
                <td className="text-right pr-3">
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
