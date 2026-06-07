-- Email system tables & columns for Al-Nour Bakery (Resend integration).
-- Run in Supabase SQL Editor if migrations are not applied yet.
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS column checks where possible.

-- -----------------------------------------------------------------------------
-- email_subscribers — newsletter list
-- -----------------------------------------------------------------------------
ALTER TABLE public.email_subscribers
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.email_subscribers.source IS
  'Where the subscriber signed up (homepage, checkout, etc.)';

-- -----------------------------------------------------------------------------
-- email_campaigns — admin marketing campaigns
-- -----------------------------------------------------------------------------
ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS recipients_type TEXT NOT NULL DEFAULT 'test';

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS recipients_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'sent';

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5, 2);

-- Allow nullable admin_id for system/draft rows
ALTER TABLE public.email_campaigns
  ALTER COLUMN admin_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_campaigns_status_check'
  ) THEN
    ALTER TABLE public.email_campaigns
      ADD CONSTRAINT email_campaigns_status_check
      CHECK (status IN ('draft', 'sent', 'failed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status
  ON public.email_campaigns (status);

COMMENT ON COLUMN public.email_campaigns.recipients_type IS
  'test = Resend sandbox (admin email only); all_subscribers = after domain verification';

-- -----------------------------------------------------------------------------
-- email_logs — every sent or failed email
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns (id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders (id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (
    email_type IN ('order_confirmation', 'offer', 'welcome', 'password_reset')
  ),
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_created
  ON public.email_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_order
  ON public.email_logs (order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_campaign
  ON public.email_logs (campaign_id)
  WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_type
  ON public.email_logs (email_type);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_logs_admin_all" ON public.email_logs;
CREATE POLICY "email_logs_admin_all"
  ON public.email_logs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "email_logs_insert_own_order" ON public.email_logs;
CREATE POLICY "email_logs_insert_own_order"
  ON public.email_logs FOR INSERT
  WITH CHECK (
    order_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "email_logs_select_own_order" ON public.email_logs;
CREATE POLICY "email_logs_select_own_order"
  ON public.email_logs FOR SELECT
  USING (
    order_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );
