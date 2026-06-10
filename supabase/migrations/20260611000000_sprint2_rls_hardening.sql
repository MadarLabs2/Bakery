-- ============================================================
-- Sprint 2: RLS and Database Hardening
--
-- Goals:
--   A. Unify admin source of truth → user_roles table
--   B. Remove customer write access to email_logs
--   C. Prevent coupon enumeration via lookup function
--   D. Replace broad FOR ALL policies with explicit operations
--   E. Ensure all sensitive tables have correct RLS
--   F. Add missing RLS policies & performance indexes
--   G. Revoke unnecessary function grants
--   H. Self-verification assertions
-- ============================================================

-- ============================================================
-- A. UNIFY ADMIN SOURCE OF TRUTH → user_roles
-- ============================================================

-- A1. Ensure user_roles exists (some schema versions may predate it).
--     CREATE IF NOT EXISTS is a no-op when the table already exists.
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- A2. Back-fill user_roles from profiles.role (idempotent).
--     Covers all users created before this migration.
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role::text
FROM   public.profiles p
ON     CONFLICT (user_id, role) DO NOTHING;

-- A3. Rewrite is_admin() to read user_roles — single source of truth.
--     Direct table scan avoids any enum-type dependency on has_role().
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE  user_id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL  ON FUNCTION public.is_admin()           FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin()         TO authenticated;

-- A4. Fix handle_new_user() to also insert into user_roles.
--     Previously the apply_admin_email_config patch only touched profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_em TEXT;
  v_new_role TEXT;
BEGIN
  -- Determine role from app_settings admin_email
  SELECT lower(trim(admin_email))
  INTO   v_admin_em
  FROM   public.app_settings
  WHERE  id = 1;

  IF v_admin_em IS NULL OR v_admin_em = '' THEN
    v_new_role := 'customer';
  ELSIF lower(trim(NEW.email)) = v_admin_em THEN
    v_new_role := 'admin';
  ELSE
    v_new_role := 'customer';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    v_new_role
  )
  ON CONFLICT (id) DO NOTHING;

  -- Populate user_roles (required for is_admin() lookups)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create active cart
  INSERT INTO public.carts (user_id, status)
  VALUES (NEW.id, 'active')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- A5. Fix apply_admin_email_role() to also sync user_roles.
--     Triggered when app_settings.admin_email is changed.
CREATE OR REPLACE FUNCTION public.apply_admin_email_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_em TEXT := lower(trim(COALESCE(NEW.admin_email, '')));
BEGIN
  IF v_em = '' THEN
    RETURN NEW;
  END IF;

  -- Demote old admins in profiles (all except the new admin email)
  UPDATE public.profiles p
  SET    role = 'customer', updated_at = now()
  FROM   auth.users u
  WHERE  p.id = u.id
    AND  p.role = 'admin'
    AND  lower(trim(u.email)) <> v_em;

  -- Remove admin row from user_roles for demoted users
  DELETE FROM public.user_roles ur
  USING  auth.users u
  WHERE  ur.user_id = u.id
    AND  ur.role    = 'admin'
    AND  lower(trim(u.email)) <> v_em;

  -- Promote new admin in profiles
  UPDATE public.profiles p
  SET    role = 'admin', updated_at = now()
  FROM   auth.users u
  WHERE  p.id = u.id
    AND  lower(trim(u.email)) = v_em;

  -- Ensure new admin has a user_roles row
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, 'admin'
  FROM   auth.users u
  WHERE  lower(trim(u.email)) = v_em
  ON     CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_admin_email_role() FROM PUBLIC;

-- ============================================================
-- B. EMAIL LOGS — REMOVE ALL CUSTOMER ACCESS
-- ============================================================
-- email_logs are written server-side via the service-role client.
-- Customers must never INSERT, UPDATE, DELETE, or SELECT email_logs.
DROP POLICY IF EXISTS "email_logs_insert_own_order"  ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_select_own_order"  ON public.email_logs;

-- Rebuild the admin policy idempotently so it uses the updated is_admin()
DROP POLICY IF EXISTS "email_logs_admin_all"         ON public.email_logs;
CREATE POLICY "email_logs_admin_all"
  ON public.email_logs FOR ALL
  USING     (public.is_admin())
  WITH CHECK(public.is_admin());

-- ============================================================
-- C. COUPONS — REPLACE ENUMERATION POLICY WITH POINT-QUERY FUNCTION
-- ============================================================
-- Drop the policy that let authenticated users list ALL active coupons.
DROP POLICY IF EXISTS "coupons_read_active"       ON public.coupons;
DROP POLICY IF EXISTS "Auth read active coupons"  ON public.coupons;

-- lookup_coupon: takes a single code, returns at most one row.
-- Customers cannot enumerate codes — they must already know the code.
CREATE OR REPLACE FUNCTION public.lookup_coupon(p_code TEXT)
RETURNS TABLE (
  id               UUID,
  code             TEXT,
  discount_type    TEXT,
  discount_value   NUMERIC,
  min_order_amount NUMERIC,
  max_uses         INTEGER,
  used_count       INTEGER,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN
)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    c.id, c.code, c.discount_type, c.discount_value,
    c.min_order_amount, c.max_uses, c.used_count, c.expires_at, c.is_active
  FROM public.coupons c
  WHERE UPPER(TRIM(c.code)) = UPPER(TRIM(p_code))
    AND c.is_active = true
  LIMIT 1;
$$;

REVOKE ALL    ON FUNCTION public.lookup_coupon(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_coupon(TEXT) TO anon, authenticated;

-- ============================================================
-- D. USER_ROLES — REPLACE BROAD FOR ALL WITH EXPLICIT POLICIES
-- ============================================================
-- Drop old policies from migration 20260428164812 if they exist
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "View own roles"      ON public.user_roles;

-- Customers: read only their own role (harmless — just confirms 'customer')
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins: explicit INSERT/UPDATE/DELETE (no self-promotion path for customers)
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles_update_admin"
  ON public.user_roles FOR UPDATE
  USING     (public.is_admin())
  WITH CHECK(public.is_admin());

CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- E. ORDERS — REMOVE DIRECT CUSTOMER INSERT (belt-and-suspenders)
-- ============================================================
-- Sprint 1 dropped these; drop again idempotently to be certain.
DROP POLICY IF EXISTS "Create own orders"         ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"         ON public.orders;

-- ============================================================
-- F. ORDER_ITEMS — REMOVE DIRECT CUSTOMER INSERT
-- ============================================================
DROP POLICY IF EXISTS "Insert own order items"        ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_own_order"  ON public.order_items;

-- ============================================================
-- G. CONTACT_MESSAGES — ENSURE CORRECT POLICIES
-- ============================================================
-- Table was created in supabase_schema.sql with RLS + policies.
-- Recreate idempotently in case this DB instance didn't have them.
DO $$
BEGIN
  ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_messages'
      AND policyname = 'contact_messages_insert_public'
  ) THEN
    CREATE POLICY "contact_messages_insert_public"
      ON public.contact_messages FOR INSERT
      WITH CHECK (
        email   ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
        AND length(message) <= 10000
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_messages'
      AND policyname = 'contact_messages_select_admin'
  ) THEN
    CREATE POLICY "contact_messages_select_admin"
      ON public.contact_messages FOR SELECT
      USING (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_messages'
      AND policyname = 'contact_messages_update_admin'
  ) THEN
    CREATE POLICY "contact_messages_update_admin"
      ON public.contact_messages FOR UPDATE
      USING     (public.is_admin())
      WITH CHECK(public.is_admin());
  END IF;
END $$;

-- ============================================================
-- H. PERFORMANCE INDEXES FOR RLS LOOKUPS
-- ============================================================
-- user_roles: fast has-role check by (user_id, role)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role
  ON public.user_roles (user_id, role);

-- orders: already has idx_orders_user_created — confirm email_logs lookup
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id
  ON public.email_logs (order_id) WHERE order_id IS NOT NULL;

-- profiles: admin lookup (for backwards-compat queries reading profiles.role)
CREATE INDEX IF NOT EXISTS idx_profiles_role_admin
  ON public.profiles (role) WHERE role = 'admin';

-- ============================================================
-- I. REVOKE FUNCTIONS NOT NEEDED BY PUBLIC/ANON
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user()  FROM PUBLIC, anon, authenticated;

-- ============================================================
-- J. SELF-VERIFICATION (raises EXCEPTION if invariants break)
-- ============================================================
DO $$
DECLARE
  v_policy_name TEXT;
BEGIN
  -- 1. user_roles must have admin rows (WARNING only — admin may not be signed up yet)
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE WARNING
      'No admin rows in user_roles — ensure app_settings.admin_email matches a registered user and re-run: UPDATE public.app_settings SET admin_email = admin_email WHERE id = 1;';
  END IF;

  -- 2. is_admin() must be SECURITY DEFINER
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_admin' AND p.prosecdef = true
  ) THEN
    RAISE EXCEPTION 'Invariant violated: is_admin() must be SECURITY DEFINER';
  END IF;

  -- 3. lookup_coupon must be SECURITY DEFINER
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'lookup_coupon' AND p.prosecdef = true
  ) THEN
    RAISE EXCEPTION 'Invariant violated: lookup_coupon() must be SECURITY DEFINER';
  END IF;

  -- 4. Customer INSERT policies on email_logs must not exist
  FOR v_policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'email_logs'
      AND policyname IN ('email_logs_insert_own_order', 'email_logs_select_own_order')
  LOOP
    RAISE EXCEPTION 'Invariant violated: policy "%" must not exist on email_logs', v_policy_name;
  END LOOP;

  -- 5. Broad coupon listing policies must not exist
  FOR v_policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'coupons'
      AND policyname IN ('coupons_read_active', 'Auth read active coupons')
  LOOP
    RAISE EXCEPTION 'Invariant violated: policy "%" must not exist on coupons', v_policy_name;
  END LOOP;

  -- 6. Orders direct INSERT policies must not exist
  FOR v_policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders'
      AND policyname IN ('Create own orders', 'orders_insert_own')
  LOOP
    RAISE EXCEPTION 'Invariant violated: policy "%" must not exist on orders', v_policy_name;
  END LOOP;

  -- 7. Order_items direct INSERT policies must not exist
  FOR v_policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items'
      AND policyname IN ('Insert own order items', 'order_items_insert_own_order')
  LOOP
    RAISE EXCEPTION 'Invariant violated: policy "%" must not exist on order_items', v_policy_name;
  END LOOP;

  RAISE NOTICE 'Sprint 2 security migration: all invariants PASSED';
END $$;
