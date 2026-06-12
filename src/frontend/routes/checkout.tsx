import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { generateUUID } from "@/frontend/lib/uuid";
import { createOrder } from "@/backend/server/createOrder.functions";
import { getPaymentConfig } from "@/backend/server/getPaymentConfig.functions";
import { resumeCardcomPayment } from "@/backend/server/resumeCardcomPayment.functions";
import { useCart } from "@/frontend/lib/cart";
import { supabase } from "@/backend/db/client";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Button } from "@/frontend/components/ui/button";
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
  validateCouponForSubtotal,
  type CouponRow,
} from "@/frontend/lib/checkoutCoupon";
import {
  validateContact,
  validateDeliveryAddress,
  type ContactFieldErrors,
} from "@/frontend/lib/checkoutValidation";
import { toast } from "sonner";
import { PENDING_CARD_ORDER_STORAGE_KEY } from "@/frontend/lib/orderPayment";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    payment: typeof search.payment === "string" ? search.payment : undefined,
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, lang } = useI18n();
  const { payment: paymentSearch, orderId: orderIdSearch } = Route.useSearch();
  const { user, session } = useAuth();
  const createOrderFn = useServerFn(createOrder);
  const getPaymentConfigFn = useServerFn(getPaymentConfig);
  const resumePaymentFn = useServerFn(resumeCardcomPayment);
  const { items, subtotal, refresh } = useCart();
  const { deliveryFee: configuredDeliveryFee } = useDeliveryFee();
  const nav = useNavigate();
  const submitLock = useRef(false);

  // One idempotency key per checkout session — regenerated on page mount.
  // If the user submits twice (race through the lock), PostgreSQL rejects the
  // duplicate and returns the already-committed order ID.
  const [idempotencyKey] = useState(() => generateUUID());

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
  const [resumingPayment, setResumingPayment] = useState(false);
  const [cardPaymentAvailable, setCardPaymentAvailable] = useState(false);
  const [pendingCardOrderId, setPendingCardOrderId] = useState<string | null>(null);

  useEffect(() => {
    void getPaymentConfigFn()
      .then((cfg) => setCardPaymentAvailable(cfg.cardPaymentAvailable))
      .catch(() => setCardPaymentAvailable(false));
  }, [getPaymentConfigFn]);

  useEffect(() => {
    let id = orderIdSearch ?? null;
    if (!id) {
      try {
        id = sessionStorage.getItem(PENDING_CARD_ORDER_STORAGE_KEY);
      } catch {
        id = null;
      }
    }
    setPendingCardOrderId(id);

    if (paymentSearch === "failed") {
      toast.error(t("cardPaymentFailed"));
    } else if (paymentSearch === "pending") {
      toast.info(t("cardPaymentPending"));
    }
  }, [orderIdSearch, paymentSearch, t]);

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
    if (!appliedCouponId || !lockedCode) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .rpc("lookup_coupon", { p_code: lockedCode })
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
  }, [subtotal, appliedCouponId, lockedCode, t, resetAppliedCoupon]);

  const deliveryFee = recv === "delivery" ? configuredDeliveryFee : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const applyCoupon = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setCouponApplying(true);
    setCouponStatus(null);
    const { data, error } = await supabase
      .rpc("lookup_coupon", { p_code: trimmed })
      .maybeSingle();
    setCouponApplying(false);
    if (error || !data) {
      resetAppliedCoupon();
      setCouponStatus({ type: "error", text: t("invalidCoupon") });
      return;
    }
    const row = data as CouponRow;
    const v = validateCouponForSubtotal(row, subtotal, t);
    if (!v.ok) {
      resetAppliedCoupon();
      setCouponStatus({ type: "error", text: v.message });
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
    if (!user || !session?.access_token || items.length === 0 || submitLock.current) return;
    if (!validateCheckout()) return;

    submitLock.current = true;
    setSubmitting(true);

    try {
      const deliveryAddress = recv === "delivery" ? formatDeliveryAddress(deliveryFields) : null;
      const couponCode      = lockedCode || null;

      const result = await createOrderFn({
        data: {
          customerName:    name.trim(),
          customerPhone:   phone.trim(),
          customerEmail:   email.trim(),
          deliveryMethod:  recv,
          deliveryAddress: deliveryAddress,
          paymentMethod:   pay === "card" ? "credit_card" : "cash",
          notes:           notes.trim() || null,
          couponCode:      couponCode,
          idempotencyKey:  idempotencyKey,
          customerLocale:  lang,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!result.ok) {
        const msg = (() => {
          try { return t(result.errorKey as Parameters<typeof t>[0]); } catch { return null; }
        })();
        const detail = "detail" in result && result.detail ? result.detail : null;
        toast.error(detail ? `${msg || t("genericError")} (${detail})` : msg || t("genericError"));
        return;
      }

      await refresh();

      if (result.requiresPayment && result.paymentRedirectUrl) {
        try {
          sessionStorage.setItem(PENDING_CARD_ORDER_STORAGE_KEY, result.orderId);
        } catch {
          /* ignore */
        }
        toast.info(t("cardPaymentRedirect"));
        window.location.href = result.paymentRedirectUrl;
        return;
      }

      toast.success(t("orderConfirmedWithEmail"));
      nav({ to: "/checkout/success", search: { orderId: result.orderId } });
    } catch (e) {
      console.error("[checkout] placeOrder:", e);
      const message = e instanceof Error ? e.message : t("genericError");
      toast.error(message);
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  const resumeCardPayment = async () => {
    if (!pendingCardOrderId || !session?.access_token || resumingPayment) return;
    setResumingPayment(true);
    try {
      const result = await resumePaymentFn({
        data: { orderId: pendingCardOrderId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!result.ok) {
        if ("alreadyPaid" in result && result.alreadyPaid) {
          try {
            sessionStorage.removeItem(PENDING_CARD_ORDER_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          nav({ to: "/checkout/success", search: { orderId: pendingCardOrderId, payment: "card" } });
          return;
        }
        const detail = "detail" in result && result.detail ? result.detail : null;
        toast.error(detail ? `${t("cardPaymentSetupFailed")} (${detail})` : t("cardPaymentSetupFailed"));
        return;
      }
      toast.info(t("cardPaymentRedirect"));
      window.location.href = result.paymentRedirectUrl;
    } catch (e) {
      console.error("[checkout] resumeCardPayment:", e);
      toast.error(t("genericError"));
    } finally {
      setResumingPayment(false);
    }
  };

  if (items.length === 0 && pendingCardOrderId) {
    const shortId = pendingCardOrderId.replace(/-/g, "").slice(0, 8).toUpperCase();
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f4]/80 via-white to-white">
        <div className="container mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-[#1B4332] sm:text-3xl">
            {t("cardPaymentResumeTitle")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("cardPaymentResumeBody")}</p>
          <p className="mt-4 font-mono text-sm text-[#1B4332]" dir="ltr">
            #{shortId}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              size="lg"
              className="h-11"
              disabled={resumingPayment}
              onClick={() => void resumeCardPayment()}
            >
              {resumingPayment ? t("placingOrder") : t("cardPaymentResumeAction")}
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11">
              <Link to="/products">{t("continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

            <PaymentMethodSelector
              value={pay}
              onChange={setPay}
              cardPaymentAvailable={cardPaymentAvailable}
            />

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
