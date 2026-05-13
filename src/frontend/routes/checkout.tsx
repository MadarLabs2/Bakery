import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useI18n, dict } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { rotateCartAfterOrder, useCart } from "@/frontend/lib/cart";
import { supabase } from "@/backend/db/client";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/frontend/components/ui/radio-group";
import { toast } from "sonner";
import { X } from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

type CouponRow = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

const COUPON_SELECT = "id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at, is_active" as const;

function validateCouponForSubtotal(
  data: CouponRow,
  subtotal: number,
  t: (key: keyof typeof dict) => string,
): { ok: true; discount: number } | { ok: false; message: string } {
  if (!data.is_active) return { ok: false, message: t("invalidCoupon") };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, message: t("couponExpired") };
  }
  if (data.max_uses != null && data.used_count >= data.max_uses) {
    return { ok: false, message: t("couponExhausted") };
  }
  const minAmt = Number(data.min_order_amount ?? 0);
  if (subtotal < minAmt) {
    return { ok: false, message: `${t("couponMinOrderLabel")}: ₪${minAmt}` };
  }
  const raw =
    data.discount_type === "percentage"
      ? (subtotal * Number(data.discount_value)) / 100
      : Number(data.discount_value);
  const capped = Math.min(Math.max(0, raw), subtotal);
  return { ok: true, discount: capped };
}

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
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [lockedCode, setLockedCode] = useState("");
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

  const resetAppliedCoupon = useCallback(() => {
    setDiscount(0);
    setAppliedCouponId(null);
    setLockedCode("");
  }, []);

  const removeCoupon = () => {
    resetAppliedCoupon();
    setCode("");
    toast.success(t("couponRemoved"));
  };

  const onCodeInputChange = (value: string) => {
    setCode(value);
    const normalized = value.trim().toUpperCase();
    if (appliedCouponId && normalized !== lockedCode) {
      resetAppliedCoupon();
    }
  };

  useEffect(() => {
    if (!appliedCouponId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("coupons")
        .select(COUPON_SELECT)
        .eq("id", appliedCouponId)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        resetAppliedCoupon();
        return;
      }
      const v = validateCouponForSubtotal(data as CouponRow, subtotal, t);
      if (!v.ok) {
        resetAppliedCoupon();
        return;
      }
      setDiscount(v.discount);
    })();
    return () => {
      cancelled = true;
    };
  }, [subtotal, appliedCouponId, t, resetAppliedCoupon]);

  const deliveryFee = recv === "delivery" ? 20 : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const applyCoupon = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const { data, error } = await supabase
      .from("coupons")
      .select(COUPON_SELECT)
      .eq("code", trimmed.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) {
      toast.error(t("invalidCoupon"));
      resetAppliedCoupon();
      return;
    }
    const row = data as CouponRow;
    const v = validateCouponForSubtotal(row, subtotal, t);
    if (!v.ok) {
      toast.error(v.message);
      resetAppliedCoupon();
      return;
    }
    setAppliedCouponId(row.id);
    setLockedCode(row.code.trim().toUpperCase());
    setCode(row.code);
    setDiscount(v.discount);
    toast.success(`${t("discountAppliedShort")} · −₪${v.discount.toFixed(2)}`);
  };

  const placeOrder = async () => {
    if (!user || items.length === 0) return;
    setSubmitting(true);

    let couponId: string | null = null;
    let orderDiscount = 0;

    if (discount > 0) {
      if (!appliedCouponId) {
        toast.error(t("checkoutCouponMissing"));
        setSubmitting(false);
        return;
      }
      const { data: cpn, error: cErr } = await supabase
        .from("coupons")
        .select(COUPON_SELECT)
        .eq("id", appliedCouponId)
        .maybeSingle();
      if (cErr || !cpn) {
        toast.error(t("invalidCoupon"));
        setSubmitting(false);
        return;
      }
      const v = validateCouponForSubtotal(cpn as CouponRow, subtotal, t);
      if (!v.ok) {
        toast.error(v.message);
        setSubmitting(false);
        return;
      }
      orderDiscount = v.discount;
      couponId = appliedCouponId;
    }

    const orderTotal = Math.max(0, subtotal - orderDiscount) + deliveryFee;

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
        discount_amount: orderDiscount,
        delivery_fee: deliveryFee,
        total_amount: orderTotal,
      })
      .select()
      .single();
    if (error || !order) {
      toast.error(error?.message ?? t("genericError"));
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
      toast.error(e instanceof Error ? e.message : t("cartResetFailed"));
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
        <div className="border-t pt-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={t("couponCode")}
              value={code}
              onChange={(e) => onCodeInputChange(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={applyCoupon} disabled={!code.trim()}>
              {t("applyCoupon")}
            </Button>
          </div>
          {appliedCouponId ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
              <span className="truncate font-medium text-[#1B4332]">
                {t("couponCode")}: {lockedCode}
              </span>
              <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2" onClick={removeCoupon}>
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">{t("couponRemoveAria")}</span>
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("checkoutOneCoupon")}</p>
          )}
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
