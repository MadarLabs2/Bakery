-- ================================================================
-- Sprint 1: Secure Order Creation
-- Adds idempotency_key to orders, removes direct INSERT policies,
-- and creates a SECURITY DEFINER function that performs the full
-- order creation flow atomically in PostgreSQL.
-- ================================================================

-- 1. Add idempotency_key column to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Partial unique index: one committed order per (user, idempotency_key)
CREATE UNIQUE INDEX IF NOT EXISTS orders_user_idempotency_key_idx
  ON public.orders (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- 2. Remove direct customer INSERT policies
--    Orders and order_items will only be written by create_order_secure.
DROP POLICY IF EXISTS "Create own orders"      ON public.orders;
DROP POLICY IF EXISTS "Insert own order items" ON public.order_items;

-- 3. Secure order creation function
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_customer_name    TEXT,
  p_customer_phone   TEXT,
  p_customer_email   TEXT,
  p_delivery_method  TEXT,   -- 'pickup' | 'delivery'
  p_delivery_address TEXT,   -- required when p_delivery_method = 'delivery'
  p_payment_method   TEXT,   -- 'cash' | 'credit_card'
  p_notes            TEXT,
  p_coupon_code      TEXT,   -- NULL or '' = no coupon
  p_idempotency_key  TEXT    -- client-generated UUID for exactly-once delivery
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
BEGIN
  -- ── Auth guard ────────────────────────────────────────────────
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERR_UNAUTHENTICATED';
  END IF;

  -- ── Basic input guards ────────────────────────────────────────
  IF trim(coalesce(p_customer_name,  '')) = '' THEN RAISE EXCEPTION 'ERR_MISSING_NAME';   END IF;
  IF trim(coalesce(p_customer_phone, '')) = '' THEN RAISE EXCEPTION 'ERR_MISSING_PHONE';  END IF;
  IF trim(coalesce(p_customer_email, '')) = '' THEN RAISE EXCEPTION 'ERR_MISSING_EMAIL';  END IF;
  IF p_delivery_method NOT IN ('pickup', 'delivery')     THEN RAISE EXCEPTION 'ERR_INVALID_DELIVERY_METHOD'; END IF;
  IF p_payment_method  NOT IN ('cash', 'credit_card')    THEN RAISE EXCEPTION 'ERR_INVALID_PAYMENT_METHOD';  END IF;

  -- ── Idempotency: return existing order if same key already committed ──
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

  -- ── Load active cart ──────────────────────────────────────────
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

  -- ── Lock product rows (consistent order = no deadlocks) and validate ──
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
    ORDER BY p.id           -- deterministic lock order prevents deadlocks
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

  -- ── Delivery fee from store_settings ─────────────────────────
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

  -- ── Validate and apply coupon ─────────────────────────────────
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

  -- ── Create order ──────────────────────────────────────────────
  BEGIN
    INSERT INTO public.orders (
      user_id,        coupon_id,
      customer_name,  customer_phone,  customer_email,
      delivery_method, delivery_address,
      payment_method, payment_status,  order_status,
      notes,          subtotal,        discount_amount,
      delivery_fee,   total_amount,    idempotency_key
    ) VALUES (
      v_user_id,      v_coupon_id,
      trim(p_customer_name), trim(p_customer_phone), trim(p_customer_email),
      p_delivery_method,
      CASE WHEN p_delivery_method = 'delivery' THEN trim(p_delivery_address) ELSE NULL END,
      p_payment_method, 'pending', 'pending',
      NULLIF(trim(COALESCE(p_notes, '')), ''),
      v_subtotal,     v_discount,      v_delivery_fee,
      v_total,        NULLIF(trim(COALESCE(p_idempotency_key, '')), '')
    )
    RETURNING id INTO v_order_id;
  EXCEPTION WHEN unique_violation THEN
    -- Race condition: another concurrent call committed the same idempotency_key
    SELECT id INTO v_existing_id
    FROM   public.orders
    WHERE  user_id        = v_user_id
      AND  idempotency_key = NULLIF(trim(COALESCE(p_idempotency_key, '')), '')
    LIMIT  1;

    IF v_existing_id IS NOT NULL THEN
      RETURN json_build_object('order_id', v_existing_id, 'idempotent', true);
    END IF;
    RAISE;  -- re-raise if we can't resolve it
  END;

  -- ── Insert order items and decrement stock ────────────────────
  -- Rows are already locked from the validation loop above.
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

  -- ── Increment coupon usage ────────────────────────────────────
  IF v_coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET    used_count = used_count + 1
    WHERE  id = v_coupon_id;
  END IF;

  -- ── Rotate cart: clear items → mark ordered → new active cart ─
  DELETE FROM public.cart_items WHERE cart_id  = v_cart_id;
  UPDATE      public.carts      SET status = 'ordered' WHERE id = v_cart_id;
  INSERT INTO public.carts (user_id, status)
  VALUES (v_user_id, 'active')
  ON CONFLICT DO NOTHING;

  RETURN json_build_object('order_id', v_order_id, 'idempotent', false);
END;
$$;

-- 4. Restrict execute: authenticated users only (not public/anon)
REVOKE ALL ON FUNCTION public.create_order_secure(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_order_secure(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;
