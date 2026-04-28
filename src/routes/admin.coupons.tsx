import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });

const empty = { code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_uses: null as number | null, expires_at: "", is_active: true };

function AdminCoupons() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const load = () => supabase.from("coupons").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      ...form, code: form.code.toUpperCase(),
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Created"); setOpen(false); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Coupons</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New coupon</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New coupon</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed (₪)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Value</Label><Input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Min order</Label><Input type="number" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} /></div>
                <div><Label>Max uses</Label><Input type="number" value={form.max_uses ?? ""} onChange={e => setForm({ ...form, max_uses: e.target.value })} /></div>
              </div>
              <div><Label>Expires at</Label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} /></div>
              <Button onClick={save} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Code</th><th>Type</th><th>Value</th><th>Min</th><th>Uses</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-mono">{c.code}</td>
                <td className="capitalize">{c.discount_type}</td>
                <td>{c.discount_type === "percentage" ? `${c.discount_value}%` : `₪${c.discount_value}`}</td>
                <td>₪{c.min_order_amount}</td>
                <td>{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                <td>{c.is_active ? "Active" : "Off"}</td>
                <td className="text-right pr-3"><Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
