import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useI18n } from "@/frontend/lib/i18n";
import { useAuth } from "@/frontend/lib/auth";
import { generateUUID } from "@/frontend/lib/uuid";
import { createOrder } from "@/backend/server/createOrder.functions";
import { getPaymentConfig } from "@/backend/server/getPaymentConfig.functions";
import { useCart } from "@/frontend/lib/cart";
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
import { emptyDeliveryAddress, formatDeliveryAddress, isDeliveryAddressComplete, type DeliveryMethod } from "@/frontend/lib/checkoutDelivery";
import { useDeliveryPlaces } from "@/frontend/hooks/useDeliveryPlaces";
import {
  calculateDeliveryFeeFromSelectedPlace,
  pickDeliveryPlaceName,
} from "@/frontend/lib/deliveryPlaces";
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
import { FulfillmentDateModal } from "@/frontend/components/checkout/FulfillmentDateModal";
import { FulfillmentDateSummary } from "@/frontend/components/checkout/FulfillmentDateSummary";
import type { FulfillmentDateSelection } from "@/frontend/lib/fulfillmentDays";
import { PENDING_CARD_ORDER_STORAGE_KEY } from "@/frontend/lib/orderPayment";
import { useReleasePendingCardOrder } from "@/frontend/lib/useReleasePendingCardOrder";
import { useRestDays } from "@/frontend/hooks/useRestDays";
import {
  isDateRestDay,
  REST_DAY_BLOCKS_CHECKOUT_TODAY,
} from "@/frontend/lib/restDays";
import { CheckoutRestDayBanner } from "@/frontend/components/checkout/CheckoutRestDayBanner";

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
  const { user, session, loading: authLoading } = useAuth();
  const createOrderFn = useServerFn(createOrder);
  const getPaymentConfigFn = useServerFn(getPaymentConfig);
  const { releaseIfNeeded } = useReleasePendingCardOrder();
  const { items, subtotal, refresh } = useCart();
  const { places: deliveryPlaces, loading: placesLoading, deliveryAvailable } = useDeliveryPlaces();
  const { restDays, isTodayRestDay: bakeryClosedToday } = useRestDays();
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
  const [restoringCart, setRestoringCart] = useState(false);
  const [orderRedirecting, setOrderRedirecting] = useState(false);
  const [cardPaymentAvailable, setCardPaymentAvailable] = useState(false);
  const [pendingCardOrderId, setPendingCardOrderId] = useState<string | null>(null);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [fulfillmentDate, setFulfillmentDate] = useState<FulfillmentDateSelection | null>(null);
  const [fulfillmentError, setFulfillmentError] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    void getPaymentConfigFn()
      .then((cfg) => setCardPaymentAvailable(cfg.cardPaymentAvailable))
      .catch(() => setCardPaymentAvailable(false));
  }, [getPaymentConfigFn]);

  useEffect(() => {
    // Only track pending card orders when explicitly returning from a payment flow.
    if (paymentSearch === "failed" && orderIdSearch) {
      setPendingCardOrderId(orderIdSearch);
      return;
    }
    if (orderIdSearch && paymentSearch === "card") {
      setPendingCardOrderId(orderIdSearch);
      return;
    }
    setPendingCardOrderId(null);
    if (!paymentSearch && !orderIdSearch) {
      try {
        sessionStorage.removeItem(PENDING_CARD_ORDER_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [orderIdSearch, paymentSearch]);

  useEffect(() => {
    if (authLoading || !pendingCardOrderId) return;

    if (paymentSearch === "failed" && orderIdSearch) {
      if (!session?.access_token) return;
      let cancelled = false;
      void (async () => {
        setRestoringCart(true);
        const outcome = await releaseIfNeeded(orderIdSearch);
        if (cancelled) return;
        setRestoringCart(false);
        setPendingCardOrderId(null);
        if (outcome === "already_paid") {
          nav({ to: "/orders", replace: true });
          return;
        }
        if (outcome === "released") {
          toast.info(t("cardCartRestored"));
          nav({ to: "/checkout", search: {}, replace: true });
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    if (paymentSearch === "card" && orderIdSearch) {
      nav({
        to: "/checkout/success",
        search: { orderId: pendingCardOrderId, payment: "card" },
        replace: true,
      });
    }
  }, [
    authLoading,
    session?.access_token,
    pendingCardOrderId,
    orderIdSearch,
    paymentSearch,
    releaseIfNeeded,
    t,
    nav,
  ]);

  useEffect(() => {
    if (authLoading) return;
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
  }, [user, authLoading, nav]);

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

  useEffect(() => {
    if (!fulfillmentDate || restDays.length === 0) return;
    if (isDateRestDay(fulfillmentDate.isoDate, restDays)) {
      setFulfillmentDate(null);
      setFulfillmentError(t("fulfillmentDateNoLongerAvailable"));
    }
  }, [restDays, fulfillmentDate, t]);

  const selectedDateIsRestDay =
    fulfillmentDate !== null && isDateRestDay(fulfillmentDate.isoDate, restDays);
  const checkoutBlockedToday = REST_DAY_BLOCKS_CHECKOUT_TODAY && bakeryClosedToday;
  const placeOrderDisabled = checkoutBlockedToday || selectedDateIsRestDay;

  useEffect(() => {
    if (!placesLoading && recv === "delivery" && !deliveryAvailable) {
      setRecv("pickup");
      setSelectedPlaceId(null);
    }
  }, [placesLoading, deliveryAvailable, recv]);

  const selectedPlace = deliveryPlaces.find((p) => p.id === selectedPlaceId) ?? null;
  const deliveryFee = calculateDeliveryFeeFromSelectedPlace(recv, selectedPlace);
  const deliveryAreaLabel =
    recv === "delivery" && selectedPlace ? pickDeliveryPlaceName(selectedPlace, lang) : null;
  const deliveryUnavailable = !placesLoading && !deliveryAvailable;
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
      if (deliveryUnavailable) {
        toast.error(t("deliveryUnavailable"));
        return false;
      }
      if (!selectedPlaceId) {
        setDeliveryErrors((prev) => ({ ...prev, deliveryPlace: t("deliveryPlaceRequired") }));
        toast.error(t("deliveryPlaceRequired"));
        return false;
      }
      const addr = validateDeliveryAddress(deliveryFields, t);
      if (!addr.ok) {
        setDeliveryErrors(addr.errors);
        toast.error(t("deliveryAddressRequiredError"));
        return false;
      }
    }
    setDeliveryErrors({});
    if (!fulfillmentDate) {
      setFulfillmentError(t("fulfillmentDateRequired"));
      toast.error(t("fulfillmentDateRequired"));
      return false;
    }
    if (checkoutBlockedToday) {
      toast.error(t("bakeryClosedToday"));
      return false;
    }
    if (isDateRestDay(fulfillmentDate.isoDate, restDays)) {
      setFulfillmentError(t("fulfillmentDateNoLongerAvailable"));
      toast.error(t("fulfillmentDateNoLongerAvailable"));
      return false;
    }
    setFulfillmentError(null);
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
          deliveryPlaceId:   recv === "delivery" ? selectedPlaceId : null,
          paymentMethod:   pay === "card" ? "credit_card" : "cash",
          notes:           notes.trim() || null,
          couponCode:      couponCode,
          idempotencyKey:       idempotencyKey,
          customerLocale:       lang,
          fulfillmentDate:      fulfillmentDate.isoDate,
          fulfillmentDayOfWeek: fulfillmentDate.dayOfWeek,
          fulfillmentLabel:     fulfillmentDate.summaryLabel,
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

      try {
        sessionStorage.removeItem(PENDING_CARD_ORDER_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setPendingCardOrderId(null);

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

      setOrderRedirecting(true);
      toast.success(t("orderConfirmedWithEmail"));
      await refresh();
      nav({ to: "/", replace: true });
    } catch (e) {
      console.error("[checkout] placeOrder:", e);
      const message = e instanceof Error ? e.message : t("genericError");
      toast.error(message);
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  if (orderRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f4]/80 via-white to-white">
        <div className="container mx-auto max-w-lg px-4 py-16 text-center">
          <p className="font-display text-xl font-semibold text-[#1B4332]">{t("orderRedirectingHome")}</p>
        </div>
      </div>
    );
  }

  if (restoringCart) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f4]/80 via-white to-white">
        <div className="container mx-auto max-w-lg px-4 py-16 text-center">
          <p className="font-display text-xl font-semibold text-[#1B4332]">{t("cardCartRestoring")}</p>
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
            {bakeryClosedToday ? <CheckoutRestDayBanner /> : null}

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
                setFulfillmentDate(null);
                setFulfillmentError(null);
                if (m === "pickup") setSelectedPlaceId(null);
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
                setFulfillmentDate(null);
              }}
              fieldErrors={deliveryErrors}
              deliveryFee={deliveryFee}
              deliveryPlaces={deliveryPlaces}
              placesLoading={placesLoading}
              deliveryUnavailable={deliveryUnavailable}
              selectedPlaceId={selectedPlaceId}
              onPlaceSelect={(id) => {
                setSelectedPlaceId(id);
                setDeliveryErrors((prev) => {
                  const next = { ...prev };
                  delete next.deliveryPlace;
                  return next;
                });
              }}
              onPickupSelected={() => setDateModalOpen(true)}
              onDeliveryAddressConfirmed={() => setDateModalOpen(true)}
              addressDialogOpen={addressDialogOpen}
              onAddressDialogOpenChange={setAddressDialogOpen}
            />

            <FulfillmentDateSummary
              method={recv}
              selection={fulfillmentDate}
              deliveryAddress={deliveryFields}
              addressComplete={isDeliveryAddressComplete(deliveryFields)}
              error={fulfillmentError}
              onChangeDate={() => setDateModalOpen(true)}
              onChangeAddress={() => setAddressDialogOpen(true)}
            />

            <FulfillmentDateModal
              open={dateModalOpen}
              onOpenChange={setDateModalOpen}
              fulfillmentType={recv}
              initialSelection={fulfillmentDate}
              onConfirm={(selection) => {
                setFulfillmentDate(selection);
                setFulfillmentError(null);
              }}
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
              scheduledDateLabel={fulfillmentDate?.summaryLabel ?? null}
              deliveryAreaLabel={deliveryAreaLabel}
              submitting={submitting}
              placeOrderDisabled={placeOrderDisabled}
              onPlaceOrder={placeOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
