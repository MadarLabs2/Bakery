-- ============================================================
-- Sprint 4: Reliable Email System — email_logs upgrade
--
-- A. Add attempt_count, sent_at columns
-- B. Drop old inline CHECK constraints, add new expanded ones
-- C. Add partial unique index for duplicate-send prevention
-- D. Update RLS (no new policies needed — Sprint 2 covers it)
-- E. Self-verification
-- ============================================================

-- ============================================================
-- A. NEW COLUMNS
-- ============================================================
ALTER TABLE public.email_logs
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS sent_at       TIMESTAMPTZ;

-- ============================================================
-- B. EXPAND CHECK CONSTRAINTS
-- Drop all existing check constraints on email_logs then re-add.
-- Inline column CHECK constraints are auto-named
-- email_logs_email_type_check / email_logs_status_check.
-- Using a DO block covers any non-standard naming.
-- ============================================================
DO $$
DECLARE
  v_con TEXT;
BEGIN
  FOR v_con IN
    SELECT conname
    FROM   pg_constraint
    JOIN   pg_class     ON pg_constraint.conrelid    = pg_class.oid
    JOIN   pg_namespace ON pg_class.relnamespace     = pg_namespace.oid
    WHERE  pg_namespace.nspname = 'public'
      AND  pg_class.relname     = 'email_logs'
      AND  pg_constraint.contype = 'c'          -- CHECK constraints only
  LOOP
    EXECUTE format('ALTER TABLE public.email_logs DROP CONSTRAINT %I', v_con);
  END LOOP;
END $$;

-- Re-add with expanded type list
ALTER TABLE public.email_logs
  ADD CONSTRAINT email_logs_email_type_check CHECK (
    email_type IN (
      -- transactional — customer
      'order_confirmation',
      'order_status_confirmed',
      'order_status_preparing',
      'order_status_ready',
      'order_status_delivered',
      'order_status_cancelled',
      -- transactional — admin
      'admin_new_order',
      -- marketing / system
      'offer',
      'welcome',
      'password_reset'
    )
  );

-- Re-add with pending/processing for future async use
ALTER TABLE public.email_logs
  ADD CONSTRAINT email_logs_status_check CHECK (
    status IN ('pending', 'processing', 'sent', 'failed')
  );

-- ============================================================
-- C. DUPLICATE-SEND PREVENTION
-- One non-failed record per (order_id, email_type).
-- Allows multiple 'failed' rows (retry history) while
-- preventing accidental double-send once a 'sent' row exists.
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS email_logs_order_type_nodup
  ON public.email_logs (order_id, email_type)
  WHERE order_id IS NOT NULL
    AND status IN ('pending', 'processing', 'sent');

-- Supporting index for fast retry lookup
CREATE INDEX IF NOT EXISTS idx_email_logs_order_type
  ON public.email_logs (order_id, email_type)
  WHERE order_id IS NOT NULL;

-- ============================================================
-- D. SELF-VERIFICATION
-- ============================================================
DO $$
BEGIN
  -- attempt_count column must exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'email_logs'
      AND column_name  = 'attempt_count'
  ) THEN
    RAISE EXCEPTION 'Sprint 4 violation: attempt_count column missing from email_logs';
  END IF;

  -- sent_at column must exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'email_logs'
      AND column_name  = 'sent_at'
  ) THEN
    RAISE EXCEPTION 'Sprint 4 violation: sent_at column missing from email_logs';
  END IF;

  -- Unique index must exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename  = 'email_logs'
      AND indexname  = 'email_logs_order_type_nodup'
  ) THEN
    RAISE EXCEPTION 'Sprint 4 violation: email_logs_order_type_nodup index missing';
  END IF;

  RAISE NOTICE 'Sprint 4 email migration: all invariants PASSED';
END $$;
