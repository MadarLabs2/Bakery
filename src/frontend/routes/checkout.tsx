import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { rotateCartAfterOrder, useCart } from "@/frontend/lib/cart";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/frontend/components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<"card" | "cash">("cash");
  const [recv, setRecv] = useState<"pickup" | "delivery">("pickup");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setName(data.full_name || "");
          setPhone(data.phone || "");
          setEmail(user.email || "");
        } else setEmail(user.email || "");
      });
  }, [user, nav]);

  const deliveryFee = recv === "delivery" ? 20 : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const applyCoupon = async () => {
    if (!code) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at, is_active")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) {
      toast.error("Invalid coupon");
      setDiscount(0);
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("Coupon expired");
      return;
    }
    if (data.max_uses != null && data.used_count >= data.max_uses) {
      toast.error("Coupon no longer available");
      return;
    }
    if (subtotal < Number(data.min_order_amount ?? 0)) {
      toast.error(`Min order ₪${data.min_order_amount}`);
      return;
    }
    const d =
      data.discount_type === "percentage"
        ? (subtotal * Number(data.discount_value)) / 100
        : Number(data.discount_value);
    setDiscount(d);
    toast.success(`-₪${d.toFixed(2)}`);
  };

  const placeOrder = async () => {
    if (!user || items.length === 0) return;
    setSubmitting(true);

    let couponId: string | null = null;
    if (discount > 0 && code) {
      const { data: cpn } = await supabase
        .from("coupons")
        .select("id")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      couponId = cpn?.id ?? null;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        coupon_id: couponId,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        delivery_address: recv === "delivery" ? address : null,
        notes,
        payment_method: pay,
        delivery_method: recv,
        payment_status: "pending",
        order_status: "pending",
        subtotal,
        discount_amount: discount,
        delivery_fee: deliveryFee,
        total_amount: total,
      })
      .select()
      .single();
    if (error || !order) {
      toast.error(error?.message ?? "Error");
      setSubmitting(false);
      return;
    }
    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product.name,
      product_price: Number(i.product.price),
      quantity: i.quantity,
      total_price: i.quantity * Number(i.product.price),
    }));
    await supabase.from("order_items").insert(orderItems);
    try {
      await rotateCartAfterOrder(user.id);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not reset cart");
      setSubmitting(false);
      return;
    }
    await refresh();
    toast.success(t("orderConfirmed"));
    nav({ to: "/orders" });
  };

  if (items.length === 0)
    return <div className="container mx-auto px-4 py-20 text-center">{t("empty")}</div>;

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="font-display text-3xl font-bold">{t("checkout")}</h1>

        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">{t("contact")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("fullName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>{t("phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <Label>{t("email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">{t("receivingMethod")}</h2>
          <RadioGroup
            value={recv}
            onValueChange={(v: any) => setRecv(v)}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="pickup" /> <span>{t("pickup")}</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="delivery" /> <span>{t("delivery")} (+₪20)</span>
            </label>
          </RadioGroup>
          {recv === "delivery" && (
            <div>
              <Label>{t("address")}</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">{t("paymentMethod")}</h2>
          <RadioGroup
            value={pay}
            onValueChange={(v: "card" | "cash") => setPay(v)}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="cash" /> <span>{t("cash")}</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value="card" /> <span>{t("creditCard")}</span>
            </label>
          </RadioGroup>
        </section>

        <section className="rounded-2xl border bg-card p-6 space-y-2">
          <Label>{t("notes")}</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="font-display text-xl font-bold">{t("total")}</h2>
        <div className="space-y-2 text-sm">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span className="truncate">
                {i.quantity}× {i.product.name}
              </span>
              <span>₪{(i.quantity * Number(i.product.price)).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex gap-2">
          <Input
            placeholder={t("couponCode")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button variant="outline" onClick={applyCoupon}>
            {t("applyCoupon")}
          </Button>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>{t("subtotal")}</span>
            <span>₪{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-primary">
              <span>{t("discount")}</span>
              <span>-₪{discount.toFixed(2)}</span>
            </div>
          )}
          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span>{t("delivery")}</span>
              <span>₪{deliveryFee.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="border-t pt-3 flex justify-between font-display text-xl font-bold">
          <span>{t("total")}</span>
          <span>₪{total.toFixed(2)}</span>
        </div>
        <Button size="lg" className="w-full" onClick={placeOrder} disabled={submitting}>
          {t("placeOrder")}
        </Button>
      </aside>
    </div>
  );
}
