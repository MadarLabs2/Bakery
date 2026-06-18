-- =============================================================================
-- RUN THIS ONCE in Supabase → SQL Editor → New query → Run
-- Project: Al-Nour Bakery — order scheduling (pickup/delivery days)
--
-- Fixes: "Could not find the table 'public.fulfillment_available_days'"
-- Same content as: supabase/migrations/20260618120000_fulfillment_available_days.sql
-- =============================================================================

-- ── 1. Available weekdays per fulfillment type ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.fulfillment_available_days (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery')),
  day_of_week      INT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  enabled          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fulfillment_type, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_fulfillment_available_days_type_enabled
  ON public.fulfillment_available_days (fulfillment_type, day_of_week)
  WHERE enabled = true;

DROP TRIGGER IF EXISTS trg_fulfillment_available_days_updated_at ON public.fulfillment_available_days;
CREATE TRIGGER trg_fulfillment_available_days_updated_at
  BEFORE UPDATE ON public.fulfillment_available_days
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.fulfillment_available_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read fulfillment days" ON public.fulfillment_available_days;
CREATE POLICY "Public read fulfillment days"
  ON public.fulfillment_available_days FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage fulfillment days" ON public.fulfillment_available_days;
CREATE POLICY "Admins manage fulfillment days"
  ON public.fulfillment_available_days FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed: Tuesday (2) and Friday (5) enabled for pickup + delivery
INSERT INTO public.fulfillment_available_days (fulfillment_type, day_of_week, enabled)
SELECT ft, dow, dow IN (2, 5)
FROM (VALUES ('pickup'), ('delivery')) AS t(ft)
CROSS JOIN generate_series(0, 6) AS dow
ON CONFLICT (fulfillment_type, day_of_week) DO NOTHING;

-- ── 2. Order columns for selected fulfillment date ───────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS selected_fulfillment_date DATE,
  ADD COLUMN IF NOT EXISTS selected_fulfillment_day_of_week INT
    CHECK (selected_fulfillment_day_of_week IS NULL OR selected_fulfillment_day_of_week BETWEEN 0 AND 6),
  ADD COLUMN IF NOT EXISTS selected_fulfillment_label TEXT;

-- ── 3. create_order_secure — validate + store fulfillment date ───────────────
DROP FUNCTION IF EXISTS public.create_order_secure(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_customer_name               TEXT,
  p_customer_phone              TEXT,
  p_customer_email              TEXT,
  p_delivery_method             TEXT,
  p_delivery_address            TEXT,
  p_payment_method              TEXT,
  p_notes                       TEXT,
  p_coupon_code                 TEXT,
  p_idempotency_key             TEXT,
  p_customer_locale             TEXT DEFAULT 'he',
  p_fulfillment_date            DATE DEFAULT NULL,
  p_fulfillment_day_of_week     INT  DEFAULT NULL,
  p_fulfillment_label           TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id         UUID           := auth.uid();
  v_cart_id         UUID;
  v_order_id        UUID;
  v_existing_id     UUID;
  v_coupon          RECORD;
  v_coupon_id       UUID           := NULL;
  v_subtotal        NUMERIC(10,2)  := 0;
  v_discount        NUMERIC(10,2)  := 0;
  v_delivery_fee    NUMERIC(10,2)  := 0;
  v_total           NUMERIC(10,2);
  v_fee_raw         TEXT;
  v_item            RECORD;
  v_locale          TEXT;
  v_dow             INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERR_UNAUTHENTICATED';
  END IF;

  IF trim(coalesce(p_customer_name,  '')) = '' THEN RAISE EXCEPTION 'ERR_MISSING_NAME';   END IF;
  IF trim(coalesce(p_customer_phone, '')) = '' THEN RAISE EXCEPTION 'ERR_MISSING_PHONE';  END IF;
  IF trim(coalesce(p_customer_email, '')) = '' THEN RAISE EXCEPTION 'ERR_MISSING_EMAIL';  END IF;
  IF p_delivery_method NOT IN ('pickup', 'delivery')     THEN RAISE EXCEPTION 'ERR_INVALID_DELIVERY_METHOD'; END IF;
  IF p_payment_method  NOT IN ('cash', 'credit_card')    THEN RAISE EXCEPTION 'ERR_INVALID_PAYMENT_METHOD';  END IF;

  v_locale := lower(trim(coalesce(p_customer_locale, 'he')));
  IF v_locale NOT IN ('en', 'he', 'ar') THEN
    v_locale := 'he';
  END IF;

  IF p_fulfillment_date IS NULL THEN
    RAISE EXCEPTION 'ERR_MISSING_FULFILLMENT_DATE';
  END IF;

  IF p_fulfillment_day_of_week IS NULL OR p_fulfillment_day_of_week NOT BETWEEN 0 AND 6 THEN
    RAISE EXCEPTION 'ERR_INVALID_FULFILLMENT_DAY';
  END IF;

  v_dow := EXTRACT(DOW FROM p_fulfillment_date)::INT;
  IF v_dow <> p_fulfillment_day_of_week THEN
    RAISE EXCEPTION 'ERR_FULFILLMENT_DAY_MISMATCH';
  END IF;

  IF p_fulfillment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'ERR_FULFILLMENT_DATE_PAST';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM   public.fulfillment_available_days fad
    WHERE  fad.fulfillment_type = p_delivery_method
      AND  fad.day_of_week      = p_fulfillment_day_of_week
      AND  fad.enabled          = true
  ) THEN
    RAISE EXCEPTION 'ERR_FULFILLMENT_DAY_NOT_AVAILABLE';
  END IF;

  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) <> '' THEN
    SELECT id INTO v_existing_id
    FROM   public.orders
    WHERE  user_id        = v_user_id
      AND  idempotency_key = trim(p_idempotency_key)
    LIMIT  1;

    IF v_existing_id IS NOT NULL THEN
      RETURN json_build_object('order_id', v_existing_id, 'idempotent', true);
    END IF;
  END IF;

  SELECT id INTO v_cart_id
  FROM   public.carts
  WHERE  user_id = v_user_id
    AND  status  = 'active'
  ORDER  BY created_at DESC
  LIMIT  1;

  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'ERR_CART_EMPTY';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE cart_id = v_cart_id) THEN
    RAISE EXCEPTION 'ERR_CART_EMPTY';
  END IF;

  FOR v_item IN
    SELECT
      p.id             AS product_id,
      p.name           AS product_name,
      p.price          AS product_price,
      p.is_available,
      p.stock_quantity,
      ci.quantity
    FROM  public.cart_items ci
    JOIN  public.products   p  ON p.id = ci.product_id
    WHERE ci.cart_id = v_cart_id
    ORDER BY p.id
    FOR UPDATE OF p
  LOOP
    IF NOT v_item.is_available THEN
      RAISE EXCEPTION 'ERR_PRODUCT_UNAVAILABLE:%', v_item.product_name;
    END IF;

    IF v_item.stock_quantity IS NOT NULL
       AND v_item.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'ERR_INSUFFICIENT_STOCK:%', v_item.product_name;
    END IF;

    v_subtotal := v_subtotal + (v_item.product_price * v_item.quantity);
  END LOOP;

  IF p_delivery_method = 'delivery' THEN
    IF p_delivery_address IS NULL OR trim(p_delivery_address) = '' THEN
      RAISE EXCEPTION 'ERR_MISSING_DELIVERY_ADDRESS';
    END IF;

    SELECT setting_value INTO v_fee_raw
    FROM   public.store_settings
    WHERE  setting_key = 'delivery_fee'
    LIMIT  1;

    v_delivery_fee := COALESCE(v_fee_raw::NUMERIC, 20);
  END IF;

  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon
    FROM   public.coupons
    WHERE  UPPER(TRIM(code)) = UPPER(TRIM(p_coupon_code))
      AND  is_active = true
    LIMIT  1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'ERR_COUPON_INVALID';
    END IF;
    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
      RAISE EXCEPTION 'ERR_COUPON_EXPIRED';
    END IF;
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
      RAISE EXCEPTION 'ERR_COUPON_EXHAUSTED';
    END IF;
    IF v_subtotal < COALESCE(v_coupon.min_order_amount, 0) THEN
      RAISE EXCEPTION 'ERR_COUPON_MIN_ORDER:%', v_coupon.min_order_amount::TEXT;
    END IF;

    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := ROUND(v_subtotal * v_coupon.discount_value / 100, 2);
    ELSE
      v_discount := LEAST(v_coupon.discount_value, v_subtotal);
    END IF;

    v_coupon_id := v_coupon.id;
  END IF;

  v_total := GREATEST(0, v_subtotal - v_discount) + v_delivery_fee;

  BEGIN
    INSERT INTO public.orders (
      user_id,        coupon_id,
      customer_name,  customer_phone,  customer_email, customer_locale,
      delivery_method, delivery_address,
      payment_method, payment_status,  order_status,
      notes,          subtotal,        discount_amount,
      delivery_fee,   total_amount,    idempotency_key,
      selected_fulfillment_date, selected_fulfillment_day_of_week, selected_fulfillment_label
    ) VALUES (
      v_user_id,      v_coupon_id,
      trim(p_customer_name), trim(p_customer_phone), trim(p_customer_email), v_locale,
      p_delivery_method,
      CASE WHEN p_delivery_method = 'delivery' THEN trim(p_delivery_address) ELSE NULL END,
      p_payment_method, 'pending', 'pending',
      NULLIF(trim(COALESCE(p_notes, '')), ''),
      v_subtotal,     v_discount,      v_delivery_fee,
      v_total,        NULLIF(trim(COALESCE(p_idempotency_key, '')), ''),
      p_fulfillment_date,
      p_fulfillment_day_of_week,
      NULLIF(trim(COALESCE(p_fulfillment_label, '')), '')
    )
    RETURNING id INTO v_order_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_existing_id
    FROM   public.orders
    WHERE  user_id        = v_user_id
      AND  idempotency_key = NULLIF(trim(COALESCE(p_idempotency_key, '')), '')
    LIMIT  1;

    IF v_existing_id IS NOT NULL THEN
      RETURN json_build_object('order_id', v_existing_id, 'idempotent', true);
    END IF;
    RAISE;
  END;

  FOR v_item IN
    SELECT
      p.id             AS product_id,
      p.name           AS product_name,
      p.price          AS product_price,
      p.stock_quantity,
      ci.quantity
    FROM  public.cart_items ci
    JOIN  public.products   p  ON p.id = ci.product_id
    WHERE ci.cart_id = v_cart_id
  LOOP
    INSERT INTO public.order_items (
      order_id,       product_id,
      product_name,   product_price,
      quantity,       total_price
    ) VALUES (
      v_order_id,     v_item.product_id,
      v_item.product_name, v_item.product_price,
      v_item.quantity, v_item.product_price * v_item.quantity
    );

    IF v_item.stock_quantity IS NOT NULL THEN
      UPDATE public.products
      SET    stock_quantity = stock_quantity - v_item.quantity
      WHERE  id = v_item.product_id;
    END IF;
  END LOOP;

  IF v_coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET    used_count = used_count + 1
    WHERE  id = v_coupon_id;
  END IF;

  DELETE FROM public.cart_items WHERE cart_id  = v_cart_id;
  UPDATE      public.carts      SET status = 'ordered' WHERE id = v_cart_id;
  INSERT INTO public.carts (user_id, status)
  VALUES (v_user_id, 'active')
  ON CONFLICT DO NOTHING;

  RETURN json_build_object('order_id', v_order_id, 'idempotent', false);
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INT, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_secure(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INT, TEXT
) TO authenticated;

-- Verify (optional — should return 14 rows)
-- SELECT fulfillment_type, day_of_week, enabled FROM public.fulfillment_available_days ORDER BY 1, 2;
