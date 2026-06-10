-- ============================================================
-- Sprint 3: Public Forms Protection
--
-- Goals:
--   A. Remove public INSERT on contact_messages (now server-side only)
--   B. Remove public INSERT on email_subscribers (now server-side only)
--   C. Self-verification assertions
--
-- Writes to both tables now go through TanStack Server Functions
-- that use the service-role (supabaseAdmin) client, which bypasses
-- RLS.  No anonymous Supabase client path remains.
-- ============================================================

-- ============================================================
-- A. CONTACT MESSAGES — REMOVE PUBLIC INSERT
-- ============================================================
-- Direct client-side INSERT is replaced by the submitContact
-- server function which validates, rate-limits, and uses
-- supabaseAdmin for the actual insert.
DROP POLICY IF EXISTS "contact_messages_insert_public" ON public.contact_messages;

-- ============================================================
-- B. EMAIL SUBSCRIBERS — REMOVE PUBLIC INSERT
-- ============================================================
-- Two policy names used across different migration versions.
DROP POLICY IF EXISTS "email_subscribers_insert_public" ON public.email_subscribers;
DROP POLICY IF EXISTS "Anyone subscribes"               ON public.email_subscribers;

-- ============================================================
-- C. SELF-VERIFICATION
-- ============================================================
DO $$
DECLARE
  v_policy TEXT;
BEGIN
  -- 1. contact_messages must have no public INSERT policy
  FOR v_policy IN
    SELECT policyname FROM pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'contact_messages'
      AND  policyname = 'contact_messages_insert_public'
  LOOP
    RAISE EXCEPTION
      'Sprint 3 violation: public INSERT policy "%" still exists on contact_messages', v_policy;
  END LOOP;

  -- 2. email_subscribers must have no public INSERT policy
  FOR v_policy IN
    SELECT policyname FROM pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  = 'email_subscribers'
      AND  policyname IN ('email_subscribers_insert_public', 'Anyone subscribes')
  LOOP
    RAISE EXCEPTION
      'Sprint 3 violation: public INSERT policy "%" still exists on email_subscribers', v_policy;
  END LOOP;

  RAISE NOTICE 'Sprint 3 migration: all invariants PASSED';
END $$;
