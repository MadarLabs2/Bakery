import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { sendOrderConfirmation } from "@/backend/server/sendOrderConfirmation.functions";
import { rotateCartAfterOrder, useCart } from "@/frontend/lib/cart";
import { supabase } from "@/backend/db/client";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { DeliveryMethodSelector, type DeliveryFieldErrors } from "@/frontend/components/DeliveryMethodSelector";
import { CheckoutCustomerForm } from "@/frontend/components/checkout/CheckoutCustomerForm";
import { PaymentMethodSelector, type PaymentMethod } from "@/frontend/components/checkout/PaymentMethodSelector";
import { CouponBox } from "@/frontend/components/checkout/CouponBox";
import { OrderSummary } from "@/frontend/components/checkout/OrderSummary";
import { CheckoutEmpty } from "@/frontend/components/checkout/CheckoutEmpty";
import { CheckoutSection } from "@/frontend/components/checkout/CheckoutSection";
import { emptyDeliveryAddress, formatDeliveryAddress, type DeliveryMethod } from "@/frontend/lib/checkoutDelivery";
import { useDeliveryFee } from "@/frontend/hooks/useDeliveryFee";
import {
  COUPON_SELECT,
  validateCouponForSubtotal,
  type CouponRow,
} from "@/frontend/lib/checkoutCoupon";
import {
  validateContact,
  validateDeliveryAddress,
  type ContactFieldErrors,
} from "@/frontend/lib/checkoutValidation";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const { t } = useI18n();
  const { user, session } = useAuth();
  const sendConfirmationFn = useServerFn(sendOrderConfirmation);
  const { items, subtotal, refresh } = useCart();
  const { deliveryFee: configuredDeliveryFee } = useDeliveryFee();
  const nav = useNavigate();
  const submitLock = useRef(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactErrors, setContactErrors] = useState<ContactFieldErrors>({});
  const [deliveryFields, setDeliveryFields] = useState(emptyDeliveryAddress);
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<PaymentMethod>("cash");
  const [recv, setRecv] = useState<DeliveryMethod>("pickup");
  const [deliveryErrors, setDeliveryErrors] = useState<DeliveryFieldErrors>({});
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [lockedCode, setLockedCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponStatus, setCouponStatus] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
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
    setCouponStatus(null);
  }, []);

  const removeCoupon = () => {
    resetAppliedCoupon();
    setCode("");
    toast.success(t("couponRemoved"));
  };

  const onCodeInputChange = (value: string) => {
    setCode(value);
    setCouponStatus(null);
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

  const deliveryFee = recv === "delivery" ? configuredDeliveryFee : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const applyCoupon = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setCouponApplying(true);
    setCouponStatus(null);
    const { data, error } = await supabase
      .from("coupons")
      .select(COUPON_SELECT)
      .eq("code", trimmed.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    setCouponApplying(false);
    if (error || !data) {
      setCouponStatus({ type: "error", text: t("invalidCoupon") });
      resetAppliedCoupon();
      return;
    }
    const row = data as CouponRow;
    const v = validateCouponForSubtotal(row, subtotal, t);
    if (!v.ok) {
      setCouponStatus({ type: "error", text: v.message });
      resetAppliedCoupon();
      return;
    }
    setAppliedCouponId(row.id);
    setLockedCode(row.code.trim().toUpperCase());
    setCode(row.code);
    setDiscount(v.discount);
    setCouponStatus({ type: "success", text: t("couponAppliedSuccess") });
    toast.success(`${t("discountAppliedShort")} · −₪${v.discount.toFixed(2)}`);
  };

  const validateCheckout = (): boolean => {
    const contact = validateContact({ name, phone, email }, t);
    if (!contact.ok) {
      setContactErrors(contact.errors);
      toast.error(contact.message ?? t("checkoutContactRequired"));
      return false;
    }
    setContactErrors({});

    if (recv === "delivery") {
      const addr = validateDeliveryAddress(deliveryFields, t);
      if (!addr.ok) {
        setDeliveryErrors(addr.errors);
        toast.error(t("deliveryAddressRequiredError"));
        return false;
      }
    }
    setDeliveryErrors({});
    return true;
  };

  const placeOrder = async () => {
    if (!user || items.length === 0 || submitLock.current) return;
    if (!validateCheckout()) return;

    submitLock.current = true;
    setSubmitting(true);

    let couponId: string | null = null;
    let orderDiscount = 0;

    try {
      if (discount > 0) {
        if (!appliedCouponId) {
          toast.error(t("checkoutCouponMissing"));
          return;
        }
        const { data: cpn, error: cErr } = await supabase
          .from("coupons")
          .select(COUPON_SELECT)
          .eq("id", appliedCouponId)
          .maybeSingle();
        if (cErr || !cpn) {
          toast.error(t("invalidCoupon"));
          return;
        }
        const v = validateCouponForSubtotal(cpn as CouponRow, subtotal, t);
        if (!v.ok) {
          toast.error(v.message);
          return;
        }
        orderDiscount = v.discount;
        couponId = appliedCouponId;
      }

      const orderTotal = Math.max(0, subtotal - orderDiscount) + deliveryFee;
      const deliveryAddress = recv === "delivery" ? formatDeliveryAddress(deliveryFields) : null;

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          coupon_id: couponId,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim(),
          delivery_address: deliveryAddress,
          notes: notes.trim() || null,
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
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        toast.error(itemsError.message);
        return;
      }

      try {
        await rotateCartAfterOrder(user.id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : t("cartResetFailed"));
        return;
      }

      await refresh();

      // Fire-and-forget: order is saved; email failure must not block checkout.
      if (session?.access_token) {
        void sendConfirmationFn({
          data: { orderId: order.id },
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch((e: unknown) => {
          console.error("[checkout] Order confirmation email:", e);
        });
      }

      toast.success(t("orderConfirmedWithEmail"));
      nav({ to: "/checkout/success", search: { orderId: order.id } });
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  if (items.length === 0) return <CheckoutEmpty />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f4]/80 via-white to-white">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/cart"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#2f6a4f] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t("backToCart")}
            </Link>
            <h1 className="font-display text-3xl font-bold text-[#1B4332] sm:text-4xl">{t("checkout")}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">{t("checkoutSubtitle")}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="space-y-5 lg:col-span-2">
            <CheckoutCustomerForm
              name={name}
              phone={phone}
              email={email}
              onNameChange={setName}
              onPhoneChange={setPhone}
              onEmailChange={setEmail}
              errors={contactErrors}
            />

            <DeliveryMethodSelector
              method={recv}
              onMethodChange={(m) => {
                setRecv(m);
                setDeliveryErrors({});
              }}
              address={deliveryFields}
              onAddressChange={(patch) => {
                setDeliveryFields((prev) => ({ ...prev, ...patch }));
                setDeliveryErrors((prev) => {
                  const next = { ...prev };
                  for (const key of Object.keys(patch) as (keyof typeof patch)[]) {
                    if (key && next[key]) delete next[key];
                  }
                  return next;
                });
              }}
              fieldErrors={deliveryErrors}
              deliveryFee={configuredDeliveryFee}
            />

            <PaymentMethodSelector value={pay} onChange={setPay} />

            <CouponBox
              code={code}
              onCodeChange={onCodeInputChange}
              onApply={applyCoupon}
              onRemove={removeCoupon}
              applying={couponApplying}
              appliedCode={appliedCouponId ? lockedCode : null}
              discount={discount}
              statusMessage={couponStatus}
            />

            <CheckoutSection icon={<MessageSquare className="h-5 w-5" />} title={t("checkoutOrderNotes")}>
              <Label htmlFor="order-notes" className="sr-only">
                {t("notes")}
              </Label>
              <Textarea
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("checkoutOrderNotesPlaceholder")}
                rows={3}
                className="resize-none"
              />
            </CheckoutSection>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              total={total}
              deliveryMethod={recv}
              paymentMethod={pay}
              submitting={submitting}
              onPlaceOrder={placeOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
