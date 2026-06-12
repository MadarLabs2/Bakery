-- CardCom LowProfile tracking on orders

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cardcom_low_profile_id TEXT,
  ADD COLUMN IF NOT EXISTS cardcom_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS cardcom_payment_fetched BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_orders_cardcom_low_profile
  ON public.orders (cardcom_low_profile_id)
  WHERE cardcom_low_profile_id IS NOT NULL;
