-- Restore cart items when a credit-card checkout is abandoned (payment not completed).

CREATE OR REPLACE FUNCTION public.release_pending_card_order(p_order_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order   RECORD;
  v_cart_id UUID;
  v_item    RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERR_UNAUTHENTICATED';
  END IF;

  SELECT *
  INTO   v_order
  FROM   public.orders
  WHERE  id = p_order_id
    AND  user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('released', false, 'reason', 'not_found');
  END IF;

  IF v_order.payment_method NOT IN ('credit_card', 'card') THEN
    RETURN json_build_object('released', false, 'reason', 'not_card');
  END IF;

  IF lower(v_order.payment_status) = 'paid' THEN
    RETURN json_build_object('released', false, 'already_paid', true);
  END IF;

  FOR v_item IN
    SELECT oi.product_id, oi.quantity, p.stock_quantity
    FROM   public.order_items oi
    LEFT JOIN public.products p ON p.id = oi.product_id
    WHERE  oi.order_id = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL AND v_item.stock_quantity IS NOT NULL THEN
      UPDATE public.products
      SET    stock_quantity = stock_quantity + v_item.quantity
      WHERE  id = v_item.product_id;
    END IF;
  END LOOP;

  IF v_order.coupon_id IS NOT NULL THEN
    UPDATE public.coupons
    SET    used_count = GREATEST(0, used_count - 1)
    WHERE  id = v_order.coupon_id;
  END IF;

  SELECT id
  INTO   v_cart_id
  FROM   public.carts
  WHERE  user_id = v_user_id
    AND  status  = 'active'
  ORDER  BY created_at DESC
  LIMIT  1;

  IF v_cart_id IS NULL THEN
    INSERT INTO public.carts (user_id, status)
    VALUES (v_user_id, 'active')
    RETURNING id INTO v_cart_id;
  END IF;

  FOR v_item IN
    SELECT oi.product_id, oi.quantity
    FROM   public.order_items oi
    WHERE  oi.order_id = p_order_id
      AND  oi.product_id IS NOT NULL
  LOOP
    IF EXISTS (
      SELECT 1
      FROM   public.cart_items
      WHERE  cart_id = v_cart_id
        AND  product_id = v_item.product_id
    ) THEN
      UPDATE public.cart_items
      SET    quantity = quantity + v_item.quantity
      WHERE  cart_id = v_cart_id
        AND  product_id = v_item.product_id;
    ELSE
      INSERT INTO public.cart_items (cart_id, product_id, quantity)
      VALUES (v_cart_id, v_item.product_id, v_item.quantity);
    END IF;
  END LOOP;

  DELETE FROM public.orders WHERE id = p_order_id;

  RETURN json_build_object('released', true);
END;
$$;

REVOKE ALL ON FUNCTION public.release_pending_card_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_pending_card_order(UUID) TO authenticated;
