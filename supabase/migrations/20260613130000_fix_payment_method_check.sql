-- Production had CHECK (payment_method IN ('card', 'cash')) while the app uses 'credit_card'.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('cash', 'credit_card', 'card'));

-- Normalize legacy 'card' rows to 'credit_card' (optional, safe to re-run)
UPDATE public.orders
SET payment_method = 'credit_card'
WHERE payment_method = 'card';
